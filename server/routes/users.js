const express = require('express');
const router = express.Router();
const User = require('../models/User');

const normalizeUserSocialReferences = async (user) => {
  if (!user) return null;

  const referencedUsernames = [...new Set([...(user.following || []), ...(user.followers || [])])];
  if (referencedUsernames.length === 0) {
    const desiredFollowing = (user.following || []).length;
    const desiredFriends = 0;
    if (user.num_following !== desiredFollowing || user.num_friends !== desiredFriends) {
      user.num_following = desiredFollowing;
      user.num_friends = desiredFriends;
      await user.save();
    }
    return user;
  }

  const existingUsers = await User.find(
    { username: { $in: referencedUsernames } },
    'username following followers'
  );
  const existingUsernames = new Set(existingUsers.map((u) => u.username));
  const userByUsername = new Map(existingUsers.map((u) => [u.username, u]));

  const normalizedFollowing = [...new Set(
    (user.following || []).filter((targetUsername) => {
      if (!existingUsernames.has(targetUsername)) return false;
      const targetUser = userByUsername.get(targetUsername);
      return (targetUser?.followers || []).includes(user.username);
    })
  )];

  const normalizedFollowers = [...new Set(
    (user.followers || []).filter((sourceUsername) => {
      if (!existingUsernames.has(sourceUsername)) return false;
      const sourceUser = userByUsername.get(sourceUsername);
      return (sourceUser?.following || []).includes(user.username);
    })
  )];
  const normalizedNumFollowing = normalizedFollowing.length;
  const normalizedNumFriends = normalizedFollowing.filter((u) => normalizedFollowers.includes(u)).length;

  const followingChanged = normalizedFollowing.length !== (user.following || []).length;
  const followersChanged = normalizedFollowers.length !== (user.followers || []).length;
  const countsChanged =
    user.num_following !== normalizedNumFollowing || user.num_friends !== normalizedNumFriends;

  if (followingChanged || followersChanged || countsChanged) {
    user.following = normalizedFollowing;
    user.followers = normalizedFollowers;
    user.num_following = normalizedNumFollowing;
    user.num_friends = normalizedNumFriends;
    await user.save();
  }

  return user;
};

// Get or create user
router.post('/', async (req, res) => {
  try {
    const { googleId, email, given_name, family_name, picture } = req.body;

    // Check if user exists
    let user = await User.findOne({ googleId });

    if (user) {
      // Only set Google picture if user has never customized their profile picture
      if (!user.hasCustomProfilePicture && picture) {
        user.profilePicture = picture;
        await user.save();
      }
      return res.json(user);
    }

    // Generate username from name
    const generateUsername = () => {
      const firstName = given_name || '';
      const lastName = family_name || '';
      return `${firstName}${lastName}`.toLowerCase().replace(/\s+/g, '');
    };

    // Create new user
    user = new User({
      googleId,
      email,
      given_name,
      family_name,
      username: generateUsername(),
      profilePicture: picture || null,
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating/fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users (must come before /:googleId)
router.get('/all', async (req, res) => {
  try {
    const users = await User.find({}, 'username profilePicture followers');
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by username (must come before /:googleId)
router.get('/username/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const normalizedUser = await normalizeUserSocialReferences(user);
    res.json(normalizedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by Google ID (catch-all route - must come last)
router.get('/:googleId', async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const normalizedUser = await normalizeUserSocialReferences(user);
    res.json(normalizedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.patch('/:googleId', async (req, res) => {
  try {
    const { username, bio, profilePicture } = req.body;

    const user = await User.findOne({ googleId: req.params.googleId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
      const oldUsername = user.username;
      const newUsername = username;

      // Validate username is URL-safe (alphanumeric, hyphens, underscores only)
      const urlSafePattern = /^[a-zA-Z0-9_-]+$/;
      if (!urlSafePattern.test(newUsername)) {
        return res.status(400).json({ message: 'Username can only contain letters, numbers, hyphens, and underscores' });
      }

      const existingUser = await User.findOne({ username: newUsername });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Update this user's username first
      user.username = newUsername;
      await user.save();

      // Propagate username change across all following/followers references.
      // Also de-duplicate arrays in case both old and new usernames existed.
      await User.updateMany(
        {
          $or: [
            { following: oldUsername },
            { followers: oldUsername },
          ],
        },
        [
          {
            $set: {
              following: {
                $setUnion: [
                  {
                    $map: {
                      input: '$following',
                      as: 'u',
                      in: {
                        $cond: [{ $eq: ['$$u', oldUsername] }, newUsername, '$$u'],
                      },
                    },
                  },
                  [],
                ],
              },
              followers: {
                $setUnion: [
                  {
                    $map: {
                      input: '$followers',
                      as: 'u',
                      in: {
                        $cond: [{ $eq: ['$$u', oldUsername] }, newUsername, '$$u'],
                      },
                    },
                  },
                  [],
                ],
              },
            },
          },
        ]
      );

      // Recalculate social counts for consistency after rename propagation.
      await User.updateMany(
        {},
        [
          {
            $set: {
              num_following: { $size: '$following' },
              num_friends: {
                $size: { $setIntersection: ['$following', '$followers'] },
              },
            },
          },
        ]
      );
    }

    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
      // Mark that user has customized their profile picture
      user.hasCustomProfilePicture = true;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Follow a user
router.post('/:googleId/follow/:targetUsername', async (req, res) => {
  try {
    const currentUser = await User.findOne({ googleId: req.params.googleId });
    const targetUser = await User.findOne({ username: req.params.targetUsername });

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent following yourself
    if (currentUser.username === targetUser.username) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if already following
    if (currentUser.following.includes(targetUser.username)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add to following/followers lists
    currentUser.following.push(targetUser.username);
    targetUser.followers.push(currentUser.username);

    // Update counts and check if they're now friends (mutual follow)
    currentUser.num_following = currentUser.following.length;
    targetUser.num_following = targetUser.following.length;

    // Calculate friends (mutual follows)
    const currentUserFriends = currentUser.following.filter(username =>
      currentUser.followers.includes(username)
    ).length;
    const targetUserFriends = targetUser.following.filter(username =>
      targetUser.followers.includes(username)
    ).length;

    currentUser.num_friends = currentUserFriends;
    targetUser.num_friends = targetUserFriends;

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: 'Successfully followed user',
      isFriend: currentUser.followers.includes(targetUser.username),
      currentUser,
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unfollow a user
router.delete('/:googleId/follow/:targetUsername', async (req, res) => {
  try {
    const currentUser = await User.findOne({ googleId: req.params.googleId });
    const targetUser = await User.findOne({ username: req.params.targetUsername });

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from following/followers lists
    currentUser.following = currentUser.following.filter(u => u !== targetUser.username);
    targetUser.followers = targetUser.followers.filter(u => u !== currentUser.username);

    // Update counts
    currentUser.num_following = currentUser.following.length;
    targetUser.num_following = targetUser.following.length;

    // Recalculate friends
    const currentUserFriends = currentUser.following.filter(username =>
      currentUser.followers.includes(username)
    ).length;
    const targetUserFriends = targetUser.following.filter(username =>
      targetUser.followers.includes(username)
    ).length;

    currentUser.num_friends = currentUserFriends;
    targetUser.num_friends = targetUserFriends;

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: 'Successfully unfollowed user',
      currentUser,
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
