const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get or create user
router.post('/', async (req, res) => {
  try {
    const { googleId, email, given_name, family_name, picture } = req.body;

    // Check if user exists
    let user = await User.findOne({ googleId });

    if (user) {
      // Update user's Google profile picture if it changed
      if (picture && picture !== user.profilePicture) {
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

// Get user by Google ID
router.get('/:googleId', async (req, res) => {
  try {
    const user = await User.findOne({ googleId: req.params.googleId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
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
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
