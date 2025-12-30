// src/pages/Room.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Dialog, DialogContent, DialogActions, TextField, Button, IconButton, Typography, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import './Room.css';
import roomBox from '../assets/images/RoomBox.svg';
import roomShelf from '../assets/images/RoomShelf.svg';
import roomTable from '../assets/images/RoomTable.svg';
import defaultProfile from '../assets/icons/DefaultProfile.svg';

function Room() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('Welcome to Shelfie!');
  const [numFriends, setNumFriends] = useState(0);
  const [numFollowing, setNumFollowing] = useState(0);
  const [profilePicture, setProfilePicture] = useState(defaultProfile);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  const USERNAME_MAX_LENGTH = 20;
  const BIO_MAX_LENGTH = 150;

  // Update page title
  useEffect(() => {
    if (username) {
      document.title = `Shelfie - @${username}'s Room`;
    } else {
      document.title = 'Shelfie';
    }
  }, [username]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && user.sub) {
        try {
          // Fetch or create user in database
          const response = await fetch('http://localhost:5001/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              googleId: user.sub,
              email: user.email,
              given_name: user.given_name,
              family_name: user.family_name,
              picture: user.picture,
            }),
          });

          if (response.ok) {
            const userData = await response.json();

            // Update user context with database data
            setUser({
              ...user,
              username: userData.username,
              bio: userData.bio,
              num_friends: userData.num_friends,
              num_following: userData.num_following,
            });

            setUsername(userData.username);
            setBio(userData.bio);
            setNumFriends(userData.num_friends || 0);
            setNumFollowing(userData.num_following || 0);

            // Use profile picture from database, or Google picture, or default
            if (userData.profilePicture) {
              setProfilePicture(userData.profilePicture);
            } else if (user.picture) {
              setProfilePicture(user.picture);
            } else {
              setProfilePicture(defaultProfile);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setIsLoaded(true);
        }
      }
    };

    fetchUserProfile();
  }, [user?.sub]); // Only re-run when user.sub changes

  const handleEditClick = () => {
    setEditedUsername(username);
    setEditedBio(bio);
    setUsernameError('');
    setEditDialogOpen(true);
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value.slice(0, USERNAME_MAX_LENGTH);
    setEditedUsername(newUsername);
    setUsernameError('');
  };

  const handleBioChange = (e) => {
    const newBio = e.target.value.slice(0, BIO_MAX_LENGTH);
    setEditedBio(newBio);
  };

  const handleRemoveProfilePic = async () => {
    try {
      // Update user profile in database to remove profile picture
      const response = await fetch(`http://localhost:5001/api/users/${user.sub}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profilePicture: null,
        }),
      });

      if (response.ok) {
        setProfilePicture(defaultProfile);
        // Update user context
        setUser({
          ...user,
          picture: null
        });
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      // Update user profile in database
      const response = await fetch(`http://localhost:5001/api/users/${user.sub}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: editedUsername,
          bio: editedBio,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();

        // Update local state
        setUsername(updatedUser.username);
        setBio(updatedUser.bio);

        // Update user context
        setUser({
          ...user,
          username: updatedUser.username,
          bio: updatedUser.bio
        });

        // Update URL to reflect new username
        navigate(`/${updatedUser.username}`, { replace: true });
        setEditDialogOpen(false);
      } else {
        const error = await response.json();
        if (error.message === 'Username already taken') {
          setUsernameError('This username is already taken');
        } else if (error.message && error.message.includes('letters, numbers, hyphens, and underscores')) {
          setUsernameError('Username can only contain letters, numbers, hyphens, and underscores');
        } else {
          console.error('Error updating profile:', error.message);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancelEdit = () => {
    setUsernameError('');
    setEditDialogOpen(false);
  };

  return (
    <div className="room-page">
      {/* Profile Section */}
      {user && isLoaded && (
        <div className="room-profile-section">
          <div className="room-profile-picture">
            <img src={profilePicture} alt="Profile" />
          </div>
          <div className="room-profile-info">
            <h2 className="room-username">@{username}</h2>
            <div className="room-stats">
              <span className="room-stat-item">{numFriends} Friends</span>
              <span className="room-stat-divider">•</span>
              <span className="room-stat-item">{numFollowing} Following</span>
            </div>
            <p className="room-bio">{bio}</p>
          </div>
          <IconButton
            onClick={handleEditClick}
            className="room-edit-button"
            sx={{
              color: 'var(--darkpurple)',
              '&:hover': {
                backgroundColor: 'rgba(91, 10, 120, 0.1)'
              }
            }}
          >
            <EditIcon />
          </IconButton>
        </div>
      )}

      {/* Edit Profile Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            backgroundColor: 'var(--darkteal)',
            position: 'relative',
          }
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={handleCancelEdit}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            zIndex: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent sx={{ padding: '32px' }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Readex Pro, sans-serif',
              fontWeight: 700,
              color: 'white',
              marginBottom: '24px',
            }}
          >
            Edit Profile
          </Typography>

          {/* Profile Picture Preview and Remove Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <img
              src={profilePicture}
              alt="Profile"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '3px solid var(--darkpurple)',
                objectFit: 'cover'
              }}
            />
            {profilePicture !== defaultProfile && (
              <Button
                onClick={handleRemoveProfilePic}
                sx={{
                  fontFamily: 'Readex Pro, sans-serif',
                  fontWeight: 600,
                  color: 'white',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  padding: '6px 16px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white',
                  },
                }}
              >
                Remove Photo
              </Button>
            )}
          </Box>

          <TextField
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={editedUsername}
            onChange={handleUsernameChange}
            error={!!usernameError}
            helperText={usernameError || `${editedUsername.length}/${USERNAME_MAX_LENGTH}`}
            sx={{
              marginBottom: 2,
              fontFamily: 'Readex Pro, sans-serif',
              '& .MuiOutlinedInput-root': {
                fontFamily: 'Readex Pro, sans-serif',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& fieldset': {
                  borderColor: usernameError ? '#ff6b6b' : 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: usernameError ? '#ff6b6b' : 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: usernameError ? '#ff6b6b' : 'white',
                },
              },
              '& .MuiInputLabel-root': {
                fontFamily: 'Readex Pro, sans-serif',
                color: usernameError ? '#ff6b6b' : 'white',
                '&.Mui-focused': {
                  color: usernameError ? '#ff6b6b' : 'white',
                },
              },
              '& .MuiFormHelperText-root': {
                fontFamily: 'Readex Pro, sans-serif',
                color: usernameError ? '#ff6b6b' : 'rgba(255, 255, 255, 0.7)',
              },
            }}
            slotProps={{
              input: {
                startAdornment: <span style={{ marginRight: 4, color: 'white' }}>@</span>
              }
            }}
          />

          <TextField
            margin="dense"
            label="Bio"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={editedBio}
            onChange={handleBioChange}
            placeholder="Tell us about yourself..."
            helperText={`${editedBio.length}/${BIO_MAX_LENGTH}`}
            sx={{
              fontFamily: 'Readex Pro, sans-serif',
              '& .MuiOutlinedInput-root': {
                fontFamily: 'Readex Pro, sans-serif',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiInputLabel-root': {
                fontFamily: 'Readex Pro, sans-serif',
                color: 'white',
                '&.Mui-focused': {
                  color: 'white',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.6)',
                opacity: 1,
              },
              '& .MuiFormHelperText-root': {
                fontFamily: 'Readex Pro, sans-serif',
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ padding: '0 32px 24px 32px', gap: '12px', justifyContent: 'flex-end' }}>
          <Button
            onClick={handleSaveEdit}
            sx={{
              fontFamily: 'Readex Pro, sans-serif',
              fontWeight: 600,
              backgroundColor: 'var(--darkpurple)',
              color: 'white',
              textTransform: 'none',
              fontSize: '1rem',
              padding: '8px 24px',
              '&:hover': {
                backgroundColor: 'var(--darkpurple)',
                opacity: 0.9,
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <div className="room-content">
        <div className="furniture-item">
          <img
            src={roomBox}
            alt="Box"
            className="room-box-image"
            onClick={() => navigate(`/${username}/to-be-read`)}
            style={{ cursor: 'pointer' }}
          />
          <button
            className="navigation-button"
            onClick={() => navigate(`/${username}/to-be-read`)}
          >
            To Be Read
          </button>
        </div>

        <div className="furniture-item">
          <img
            src={roomTable}
            alt="Table"
            className="room-table-image"
            onClick={() => navigate(`/${username}/currently-reading`)}
            style={{ cursor: 'pointer' }}
          />
          <button
            className="navigation-button"
            onClick={() => navigate(`/${username}/currently-reading`)}
          >
            Currently Reading
          </button>
        </div>

        <div className="furniture-item">
          <img
            src={roomShelf}
            alt="Bookshelf"
            className="room-shelf-image"
            onClick={() => navigate(`/${username}/read`)}
            style={{ cursor: 'pointer' }}
          />
          <button
            className="navigation-button"
            onClick={() => navigate(`/${username}/read`)}
          >
            Read
          </button>
        </div>
      </div>

      <div className="room-background" />
      <div className="room-floor" />
    </div>
  );
}

export default Room;