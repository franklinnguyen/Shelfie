// src/pages/Room.js
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Dialog, DialogContent, DialogActions, TextField, Button, IconButton, Typography, Box, List, ListItem, ListItemText, ListItemAvatar, Avatar, Tabs, Tab, InputAdornment } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PeopleIcon from '@mui/icons-material/People';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import './Room.css';
import roomBox from '../assets/images/RoomBox.svg';
import roomShelf from '../assets/images/RoomShelf.svg';
import roomTable from '../assets/images/RoomTable.svg';
import defaultProfile from '../assets/icons/DefaultProfile.svg';

function Room() {
  const navigate = useNavigate();
  const { username: urlUsername } = useParams();
  const { user, setUser } = useUser();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('Welcome to Shelfie!');
  const [numFollowers, setNumFollowers] = useState(0);
  const [numFollowing, setNumFollowing] = useState(0);
  const [profilePicture, setProfilePicture] = useState(defaultProfile);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedProfilePicture, setEditedProfilePicture] = useState('');
  const [previewProfilePicture, setPreviewProfilePicture] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [socialTab, setSocialTab] = useState(0);
  const [userProfilePictures, setUserProfilePictures] = useState({});

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

  // Fetch the logged-in user's data and store in context
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      if (user && user.sub && !user.username) {
        try {
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
          }
        } catch (error) {
          console.error('Error fetching logged-in user:', error);
        }
      }
    };

    fetchLoggedInUser();
  }, [user?.sub]);

  // Fetch profile data based on URL username
  useEffect(() => {
    const fetchProfileUser = async () => {
      if (!urlUsername) {
        setIsLoaded(true);
        return;
      }

      // Handle guest user profile specially
      if (urlUsername === 'guest' && user?.isGuest) {
        setUsername('guest');
        setBio('Welcome to Shelfie! As a guest user, any changes you make will not be saved.');
        setNumFollowers(0);
        setNumFollowing(user.following?.length || 0);
        setFollowingList(user.following || []);
        setFollowersList([]);
        setProfilePicture(defaultProfile);
        setIsOwnProfile(true);
        setIsFollowing(false);
        setIsLoaded(true);
        return;
      }

      try {
        // Fetch user by username from URL
        const response = await fetch(`http://localhost:5001/api/users/username/${urlUsername}`);

        if (response.ok) {
          const userData = await response.json();
          setUsername(userData.username);
          setBio(userData.bio);
          setNumFollowers(userData.followers?.length || 0);
          setNumFollowing(userData.num_following || 0);

          // Set following/followers lists
          setFollowingList(userData.following || []);
          setFollowersList(userData.followers || []);

          // Set profile picture
          if (userData.profilePicture) {
            setProfilePicture(userData.profilePicture);
          } else {
            setProfilePicture(defaultProfile);
          }

          // Check if this is the logged-in user's own profile
          if (user && user.username === userData.username) {
            setIsOwnProfile(true);
            setIsFollowing(false);
          } else {
            setIsOwnProfile(false);
            // Check if logged-in user is following this profile
            if (user && user.username) {
              const following = (userData.followers || []).includes(user.username);
              setIsFollowing(following);
            }
          }
        } else {
          console.error('User not found');
          // Redirect to home if user doesn't exist
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error fetching profile user:', error);
        // Redirect to home on error
        navigate('/');
        return;
      } finally {
        setIsLoaded(true);
      }
    };

    fetchProfileUser();
  }, [urlUsername, user?.username, user?.isGuest, user?.following]);

  const handleEditClick = () => {
    setEditedUsername(username);
    setEditedBio(bio);
    setEditedProfilePicture(profilePicture === defaultProfile ? '' : profilePicture);
    setPreviewProfilePicture(profilePicture);
    setUsernameError('');
    setEditDialogOpen(true);
  };

  const handleUpdatePreview = () => {
    if (editedProfilePicture.trim()) {
      setPreviewProfilePicture(editedProfilePicture);
    } else {
      setPreviewProfilePicture(defaultProfile);
    }
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
        setEditedProfilePicture(''); // Clear the URL input
        setPreviewProfilePicture(defaultProfile); // Update preview to default
        // Update user context
        setUser({
          ...user,
          picture: null,
          profilePicture: null,
        });
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
    }
  };

  const handleSaveEdit = async () => {
    // Prevent guest users from saving profile changes
    if (user?.isGuest) {
      alert('Guest users cannot edit their profile. Please sign in to edit your profile.');
      return;
    }

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
          profilePicture: editedProfilePicture || null,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();

        // Update local state
        setUsername(updatedUser.username);
        setBio(updatedUser.bio);
        setProfilePicture(updatedUser.profilePicture || defaultProfile);

        // Update user context
        setUser({
          ...user,
          username: updatedUser.username,
          bio: updatedUser.bio,
          profilePicture: updatedUser.profilePicture,
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
    // Reset all fields to original values
    setEditedUsername(username);
    setEditedBio(bio);
    setEditedProfilePicture(profilePicture === defaultProfile ? '' : profilePicture);
    setPreviewProfilePicture(profilePicture);
    setUsernameError('');
    setEditDialogOpen(false);
  };

  const handleFollow = async () => {
    if (!user || !user.sub) {
      console.error('No user logged in');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/users/${user.sub}/follow/${username}`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(true);

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

        // Refresh profile to get updated counts
        const profileResponse = await fetch(`http://localhost:5001/api/users/username/${urlUsername}`);
        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          setNumFollowers(userData.followers?.length || 0);
          setFollowersList(userData.followers || []);
          setFollowingList(userData.following || []);
        }
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async () => {
    if (!user || !user.sub) {
      console.error('No user logged in');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/users/${user.sub}/follow/${username}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(false);

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

        // Refresh profile to get updated counts
        const profileResponse = await fetch(`http://localhost:5001/api/users/username/${urlUsername}`);
        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          setNumFollowers(userData.followers?.length || 0);
          setFollowersList(userData.followers || []);
          setFollowingList(userData.following || []);
        }
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const handleOpenSocialDialog = async () => {
    setFollowersDialogOpen(true);

    // Fetch profile pictures for all users in following and followers lists
    const allUsernames = [...new Set([...followingList, ...followersList])];
    const pictures = {};

    for (const username of allUsernames) {
      try {
        const response = await fetch(`http://localhost:5001/api/users/username/${username}`);
        if (response.ok) {
          const userData = await response.json();
          pictures[username] = userData.profilePicture || defaultProfile;
        }
      } catch (error) {
        console.error(`Error fetching profile picture for ${username}:`, error);
        pictures[username] = defaultProfile;
      }
    }

    setUserProfilePictures(pictures);
  };

  const handleCloseSocialDialog = () => {
    setFollowersDialogOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setSocialTab(newValue);
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
            <div className="room-stats" style={{ cursor: 'pointer' }} onClick={handleOpenSocialDialog}>
              <span className="room-stat-item">{numFollowing} Following</span>
              <span className="room-stat-divider">•</span>
              <span className="room-stat-item">{numFollowers} Followers</span>
            </div>
            <p className="room-bio">{bio}</p>
          </div>
          {isOwnProfile && (
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
          )}
          {!isOwnProfile && username !== 'guest' && (
            <IconButton
              onClick={isFollowing ? handleUnfollow : handleFollow}
              className="room-edit-button"
              sx={{
                color: isFollowing ? 'var(--darkpurple)' : 'var(--lightteal)',
                '&:hover': {
                  backgroundColor: isFollowing ? 'rgba(91, 10, 120, 0.1)' : 'rgba(0, 128, 128, 0.1)'
                }
              }}
              title={isFollowing ? 'Following - Click to unfollow' : 'Follow'}
            >
              {isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
            </IconButton>
          )}
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
              src={previewProfilePicture}
              alt="Profile Preview"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '3px solid var(--darkpurple)',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.src = defaultProfile;
              }}
            />
            {previewProfilePicture !== defaultProfile && (
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
            label="Profile Picture URL"
            type="text"
            fullWidth
            variant="outlined"
            value={editedProfilePicture}
            onChange={(e) => setEditedProfilePicture(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleUpdatePreview();
              }
            }}
            placeholder="https://example.com/your-image.jpg"
            helperText="Enter an image URL and click the arrow to preview"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleUpdatePreview}
                      sx={{
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                      title="Update preview"
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
            sx={{
              marginBottom: 2,
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

      {/* Social Dialog - Following/Followers */}
      <Dialog
        open={followersDialogOpen}
        onClose={handleCloseSocialDialog}
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
        <IconButton
          onClick={handleCloseSocialDialog}
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
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <PeopleIcon /> Social
          </Typography>

          <Tabs
            value={socialTab}
            onChange={handleTabChange}
            sx={{
              marginBottom: '16px',
              '& .MuiTab-root': {
                fontFamily: 'Readex Pro, sans-serif',
                color: 'rgba(255, 255, 255, 0.6)',
                textTransform: 'none',
                fontSize: '1rem',
                '&.Mui-selected': {
                  color: 'white',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'var(--darkpurple)',
              },
            }}
          >
            <Tab label={`Following (${followingList.length})`} />
            <Tab label={`Followers (${followersList.length})`} />
          </Tabs>

          <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
            {socialTab === 0 && (
              <List>
                {followingList.length > 0 ? (
                  followingList.map((followingUsername) => (
                    <ListItem
                      key={followingUsername}
                      sx={{
                        padding: '8px 0',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        },
                      }}
                      onClick={() => {
                        handleCloseSocialDialog();
                        navigate(`/${followingUsername}`);
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={userProfilePictures[followingUsername] || defaultProfile}
                          alt={followingUsername}
                          sx={{
                            width: 40,
                            height: 40,
                            border: '2px solid var(--darkpurple)',
                          }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={`@${followingUsername}`}
                        sx={{
                          '& .MuiTypography-root': {
                            fontFamily: 'Readex Pro, sans-serif',
                            color: 'white',
                          },
                        }}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography
                    sx={{
                      fontFamily: 'Readex Pro, sans-serif',
                      color: 'rgba(255, 255, 255, 0.6)',
                      textAlign: 'center',
                      padding: '16px',
                    }}
                  >
                    Not following anyone yet
                  </Typography>
                )}
              </List>
            )}

            {socialTab === 1 && (
              <List>
                {followersList.length > 0 ? (
                  followersList.map((followerUsername) => (
                    <ListItem
                      key={followerUsername}
                      sx={{
                        padding: '8px 0',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        },
                      }}
                      onClick={() => {
                        handleCloseSocialDialog();
                        navigate(`/${followerUsername}`);
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={userProfilePictures[followerUsername] || defaultProfile}
                          alt={followerUsername}
                          sx={{
                            width: 40,
                            height: 40,
                            border: '2px solid var(--darkpurple)',
                          }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={`@${followerUsername}`}
                        sx={{
                          '& .MuiTypography-root': {
                            fontFamily: 'Readex Pro, sans-serif',
                            color: 'white',
                          },
                        }}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography
                    sx={{
                      fontFamily: 'Readex Pro, sans-serif',
                      color: 'rgba(255, 255, 255, 0.6)',
                      textAlign: 'center',
                      padding: '16px',
                    }}
                  >
                    No followers yet
                  </Typography>
                )}
              </List>
            )}
          </Box>
        </DialogContent>
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