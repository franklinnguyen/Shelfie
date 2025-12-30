// src/pages/Room.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Dialog, DialogContent, DialogActions, TextField, Button, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import './Room.css';
import roomBox from '../assets/images/RoomBox.svg';
import roomShelf from '../assets/images/RoomShelf.svg';
import roomTable from '../assets/images/RoomTable.svg';

function Room() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('Welcome to Shelfie!');
  const [numFriends, setNumFriends] = useState(0);
  const [numFollowing, setNumFollowing] = useState(0);
  const [profilePicture, setProfilePicture] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const USERNAME_MAX_LENGTH = 20;
  const BIO_MAX_LENGTH = 150;

  useEffect(() => {
    if (user) {
      // Generate default username from Google account name only if not already set
      const generateUsername = () => {
        const firstName = user.given_name || '';
        const lastName = user.family_name || '';
        // TODO: Check if firstName+lastName already exists in database
        // For now, just use firstName+lastName without random identifier
        return `${firstName}${lastName}`.toLowerCase().replace(/\s+/g, '');
      };

      const generatedUsername = user.username || generateUsername();

      // Only update user context if username was generated for the first time
      if (!user.username) {
        setUser({
          ...user,
          username: generatedUsername,
          bio: user.bio || 'Welcome to Shelfie!'
        });
      }

      setUsername(generatedUsername);
      setBio(user.bio || 'Welcome to Shelfie!');
      setNumFriends(user.num_friends || 0);
      setNumFollowing(user.num_following || 0);
      setProfilePicture(user.picture || '');
    }
  }, [user, setUser]);

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

  const handleSaveEdit = async () => {
    // Check if username is different from current
    if (editedUsername !== username) {
      // TODO: Check with backend if username already exists
      // For now, simulate checking against localStorage (mock check)
      const savedUser = localStorage.getItem('shelfie_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        // This is a placeholder - in real app, check against all users in database
        if (editedUsername === 'taken' || editedUsername === 'admin') {
          setUsernameError('This username is already taken');
          return;
        }
      }
    }

    // Update local state
    setUsername(editedUsername);
    setBio(editedBio);

    // Update user context (will be saved to localStorage)
    setUser({
      ...user,
      username: editedUsername,
      bio: editedBio
    });

    setEditDialogOpen(false);
  };

  const handleCancelEdit = () => {
    setUsernameError('');
    setEditDialogOpen(false);
  };

  return (
    <div className="room-page">
      {/* Profile Section */}
      <div className="room-profile-section">
        <div className="room-profile-picture">
          {profilePicture && (
            <img src={profilePicture} alt="Profile" />
          )}
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

        <DialogActions sx={{ padding: '16px 32px', gap: '12px', justifyContent: 'flex-end' }}>
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
            onClick={() => navigate('/to-be-read')}
            style={{ cursor: 'pointer' }}
          />
          <button
            className="navigation-button"
            onClick={() => navigate('/to-be-read')}
          >
            To Be Read
          </button>
        </div>

        <div className="furniture-item">
          <img
            src={roomTable}
            alt="Table"
            className="room-table-image"
            onClick={() => navigate('/currently-reading')}
            style={{ cursor: 'pointer' }}
          />
          <button
            className="navigation-button"
            onClick={() => navigate('/currently-reading')}
          >
            Currently Reading
          </button>
        </div>

        <div className="furniture-item">
          <img
            src={roomShelf}
            alt="Bookshelf"
            className="room-shelf-image"
            onClick={() => navigate('/read')}
            style={{ cursor: 'pointer' }}
          />
          <button
            className="navigation-button"
            onClick={() => navigate('/read')}
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