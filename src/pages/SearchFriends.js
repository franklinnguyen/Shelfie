import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, IconButton, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CloseIcon from '@mui/icons-material/Close';
import { API_URL } from '../config';
import './SearchFriends.css';
import defaultProfile from '../assets/icons/DefaultProfile.svg';
import { useUser } from '../context/UserContext';

const SearchFriends = () => {
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [guestWarningOpen, setGuestWarningOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  // Update page title
  useEffect(() => {
    document.title = 'Shelfie';
  }, []);

  // Fetch all users on component mount and when following changes
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/all`);
        if (response.ok) {
          const users = await response.json();

          // Filter out the logged-in user and guest users, then sort alphabetically
          const filteredUsers = users.filter(u =>
            u.username !== 'guest' && (!user?.username || u.username !== user.username)
          );
          const sortedUsers = filteredUsers.sort((a, b) =>
            a.username.localeCompare(b.username)
          );

          setAllUsers(sortedUsers);
          setFilteredUsers(sortedUsers);

          // Initialize follow status for each user
          if (user && user.username) {
            const status = {};
            sortedUsers.forEach(u => {
              // For guest users, check their following array
              // For regular users, check if they're in the other user's followers
              if (user.isGuest) {
                status[u.username] = (user.following || []).includes(u.username);
              } else {
                status[u.username] = (u.followers || []).includes(user.username);
              }
            });
            setFollowStatus(status);
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchAllUsers();
  }, [user?.username, JSON.stringify(user?.following)]);

  // Filter users based on search input
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter(user =>
        user.username.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [search, allUsers]);

  const handleUserClick = (username) => {
    navigate(`/${username}`);
  };

  const handleFollow = async (username, event) => {
    event.stopPropagation(); // Prevent navigation when clicking follow button

    if (!user || !user.sub) {
      console.error('No user logged in');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/${user.sub}/follow/${username}`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();

        // Update follow status
        setFollowStatus(prev => ({
          ...prev,
          [username]: true
        }));

        // Update user context with new following count
        if (data.currentUser) {
          setUser({
            ...user,
            num_following: data.currentUser.num_following,
            num_friends: data.currentUser.num_friends,
            following: data.currentUser.following,
            followers: data.currentUser.followers,
          });
        }
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (username, event) => {
    event.stopPropagation(); // Prevent navigation when clicking unfollow button

    // Check if user is in guest mode
    if (user?.isGuest) {
      setGuestWarningOpen(true);
      return;
    }

    if (!user || !user.sub) {
      console.error('No user logged in');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/${user.sub}/follow/${username}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();

        // Update follow status
        setFollowStatus(prev => ({
          ...prev,
          [username]: false
        }));

        // Update user context
        if (data.currentUser) {
          setUser({
            ...user,
            num_following: data.currentUser.num_following,
            num_friends: data.currentUser.num_friends,
            following: data.currentUser.following,
            followers: data.currentUser.followers,
          });
        }
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const handleGuestWarningClose = () => {
    setGuestWarningOpen(false);
  };

  return (
    <div className="search-friends-page">
      <div className="friends-header">
        <div className="friends-row">
          <h2>Find Your Friends</h2>
          <div className="friends-search">
            <input
              type="text"
              placeholder="Enter Your Friend's Username"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="users-container">
        {filteredUsers.map((displayUser) => (
          <div
            key={displayUser._id}
            className="user-card"
            onClick={() => handleUserClick(displayUser.username)}
          >
            <Avatar
              src={displayUser.profilePicture || defaultProfile}
              alt={displayUser.username}
              sx={{
                width: 60,
                height: 60,
                border: '3px solid var(--darkteal)',
              }}
            />
            <span className="user-username">@{displayUser.username}</span>

            {/* Show follow/unfollow button */}
            {user && user.username && (
              <IconButton
                onClick={(e) => followStatus[displayUser.username]
                  ? handleUnfollow(displayUser.username, e)
                  : handleFollow(displayUser.username, e)
                }
                className="follow-button"
                sx={{
                  marginTop: '8px',
                  color: followStatus[displayUser.username] ? 'var(--darkpurple)' : 'var(--lightteal)',
                  backgroundColor: 'var(--white)',
                  border: `2px solid ${followStatus[displayUser.username] ? 'var(--darkpurple)' : 'var(--lightteal)'}`,
                  '&:hover': {
                    backgroundColor: followStatus[displayUser.username] ? 'rgba(91, 10, 120, 0.1)' : 'rgba(0, 128, 128, 0.1)',
                  },
                }}
                title={followStatus[displayUser.username] ? 'Following - Click to unfollow' : 'Follow'}
              >
                {followStatus[displayUser.username] ? <PersonRemoveIcon /> : <PersonAddIcon />}
              </IconButton>
            )}
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && search.trim() !== '' && (
        <div className="no-results">
          <p>No users found matching "{search}"</p>
        </div>
      )}

      {/* Guest Warning Dialog */}
      <Dialog
        open={guestWarningOpen}
        onClose={handleGuestWarningClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            backgroundColor: 'var(--lightpurple)',
          }
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: 'Readex Pro, sans-serif',
            fontWeight: 700,
            color: 'var(--darkpurple)',
            fontSize: '1.5rem',
            paddingBottom: '8px',
            position: 'relative',
          }}
        >
          Guest Mode
          <IconButton
            onClick={handleGuestWarningClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'var(--darkpurple)',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '16px' }}>
          <Typography
            sx={{
              fontFamily: 'Readex Pro, sans-serif',
              color: 'var(--darkpurple)',
              fontSize: '1rem',
              lineHeight: 1.8,
            }}
          >
            Unfollowing friends is not available in guest mode. Please sign in with a Google account to access this feature.
          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchFriends;
