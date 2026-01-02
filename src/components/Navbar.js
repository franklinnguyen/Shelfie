import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Box, IconButton, Dialog, DialogContent, DialogTitle, Typography, Badge } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ReplyIcon from '@mui/icons-material/Reply';
import { useNavigate, useLocation } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import { useUser } from '../context/UserContext';
import { API_URL } from '../config';
import './Navbar.css';
import shelfieWideLogo from '../assets/images/ShelfieWideLogo.svg';
import shelfieSquareLogo from '../assets/images/ShelfieSquareLogo.svg';
import roomIcon from '../assets/icons/RoomIcon.svg';
import addIcon from '../assets/icons/AddIcon.svg';
import homeIcon from '../assets/icons/HomeIcon.svg';
import searchIcon from '../assets/icons/SearchIcon.svg';
import tealRoomIcon from '../assets/icons/TealRoomIcon.svg';
import tealAddIcon from '../assets/icons/TealAddIcon.svg';
import tealHomeIcon from '../assets/icons/TealHomeIcon.svg';
import tealSearchIcon from '../assets/icons/TealSearchIcon.svg';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, exitGuestMode } = useUser();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Fetch notifications and unread count
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && user.sub && !user.isGuest) {
        try {
          const [notifResponse, countResponse] = await Promise.all([
            fetch(`${API_URL}/api/notifications/${user.sub}`),
            fetch(`${API_URL}/api/notifications/${user.sub}/unread-count`)
          ]);

          if (notifResponse.ok) {
            const notifData = await notifResponse.json();
            setNotifications(notifData);
          }

          if (countResponse.ok) {
            const countData = await countResponse.json();
            setUnreadCount(countData.count);
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    };

    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    if (user?.isGuest) {
      // For guest mode, just exit without calling googleLogout
      exitGuestMode();
    } else {
      // For regular users, logout from Google
      googleLogout();
      setUser(null); // Clear user from context (and localStorage)
    }
    navigate('/login');
  };

  const handleAboutOpen = () => {
    setAboutOpen(true);
  };

  const handleAboutClose = () => {
    setAboutOpen(false);
  };

  const handleNotificationsOpen = () => {
    setNotificationsOpen(true);
  };

  const handleNotificationsClose = () => {
    setNotificationsOpen(false);
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await fetch(`${API_URL}/api/notifications/${notification._id}/read`, {
          method: 'PATCH',
        });
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n =>
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate to home feed (where posts are displayed)
    setNotificationsOpen(false);
    navigate('/', { state: { scrollToBookId: notification.bookId } });
  };

  const handleMarkAllRead = async () => {
    if (user && user.sub) {
      try {
        await fetch(`${API_URL}/api/notifications/${user.sub}/read-all`, {
          method: 'PATCH',
        });
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (error) {
        console.error('Error marking all as read:', error);
      }
    }
  };

  return (
    <AppBar position="sticky" className="navbar" disableRipple elevation={0}>
      <Toolbar disableGutters style={{ padding: '0 16px' }}>
        <img
          src={shelfieWideLogo}
          alt="Shelfie Wide Logo"
          className="shelfie-wide-logo navbar-logo"
          onClick={() => navigate('/')}
        />
        <img
          src={shelfieSquareLogo}
          alt="Shelfie Square Logo"
          className="shelfie-square-logo navbar-logo"
          onClick={() => navigate('/')}
        />
        <Box className="navbar-icons">
          <img
            src={isActive('/') ? tealHomeIcon : homeIcon}
            alt="HomeIcon"
            className="navbar-icon"
            onClick={() => navigate('/')}
          />
          <img
            src={isActive('/search-books') ? tealSearchIcon : searchIcon}
            alt="SearchIcon"
            className="navbar-icon"
            onClick={() => navigate('/search-books')}
          />
          <img
            src={isActive('/search-friends') ? tealAddIcon : addIcon}
            alt="AddIcon"
            className="navbar-icon"
            onClick={() => navigate('/search-friends')}
          />
          <img
            src={isActive(`/${user?.username}`) ? tealRoomIcon : roomIcon}
            alt="RoomIcon"
            className="navbar-icon"
            onClick={() => navigate(`/${user?.username || ''}`)}
          />
        </Box>
        <IconButton
          onClick={handleAboutOpen}
          className="info-button"
          sx={{
            marginLeft: 'auto',
            color: 'var(--darkpurple)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(91, 10, 120, 0.1)',
              transform: 'scale(1.1)'
            }
          }}
          title="About Shelfie"
        >
          <InfoIcon />
        </IconButton>
        {!user?.isGuest && (
          <IconButton
            onClick={handleNotificationsOpen}
            className="notification-button"
            sx={{
              marginLeft: '8px',
              color: 'var(--darkpurple)',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(91, 10, 120, 0.1)',
                transform: 'scale(1.1)'
              }
            }}
            title="Notifications"
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        )}
        <IconButton
          onClick={handleLogout}
          className="logout-button"
          sx={{
            marginLeft: '8px',
            color: 'var(--darkpurple)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(91, 10, 120, 0.1)',
              transform: 'scale(1.1)'
            }
          }}
          title="Logout"
        >
          <LogoutIcon />
        </IconButton>
      </Toolbar>

      {/* About Dialog */}
      <Dialog
        open={aboutOpen}
        onClose={handleAboutClose}
        maxWidth="md"
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
            fontSize: '1.75rem',
            paddingBottom: '8px',
            position: 'relative',
          }}
        >
          About Shelfie
          <IconButton
            onClick={handleAboutClose}
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
              marginBottom: '16px',
            }}
          >
            Shelfie was originally developed for MIT's 2024 web.lab: a month-long web development class and competition
            open to students of all skill levels. The first two weeks of the class focused on learning web development
            fundamentals, and the remaining two weeks were dedicated to developing Shelfie from scratch.
          </Typography>
          <Typography
            sx={{
              fontFamily: 'Readex Pro, sans-serif',
              color: 'var(--darkpurple)',
              fontSize: '1rem',
              lineHeight: 1.8,
              marginBottom: '16px',
            }}
          >
            Our idea was sparked by our shared love for reading and recognizing clear opportunities for improvement
            in existing platforms like Goodreads. <strong>Franklin Nguyen</strong> (MIT Class of 2025) served as the lead front-end
            developer, designing the site in Figma, creating many of the components and icons in Adobe Illustrator, and
            building the unique UI for organizing books. <strong>Grace Li</strong> (MIT Class of 2025) focused on backend
            development and database schema design. <strong>Dannell Lopez</strong> (MIT Class of 2027) tied everything together,
            integrating the Google Books API and designing the 3D book for the landing page.
          </Typography>
          <Typography
            sx={{
              fontFamily: 'Readex Pro, sans-serif',
              color: 'var(--darkpurple)',
              fontSize: '1rem',
              lineHeight: 1.8,
              marginBottom: '16px',
            }}
          >
            None of us had learned web development prior to this class, yet we left winning <strong>Most Innovative UI Feature</strong> out
            of 89 competing teams. Since the competition concluded, Franklin meticulously refined the
            platform, added new features, and enhanced the user experience to create the polished reading companion
            you see today.
          </Typography>
          <Typography
            sx={{
              fontFamily: 'Readex Pro, sans-serif',
              color: 'var(--darkpurple)',
              fontSize: '1rem',
              lineHeight: 1.8,
              marginBottom: '16px',
            }}
          >
            Shelfie is built using the <strong>MERN stack</strong> (MongoDB, Express.js, React, Node.js) with additional technologies
            including HTML/CSS for styling, Material-UI for components, and the Google Books API for book data. Books are dynamically
            organized in containers styled as boxes, tables, and shelves for a unique visual library experience.
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog
        open={notificationsOpen}
        onClose={handleNotificationsClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            backgroundColor: 'var(--lightpurple)',
            maxHeight: '80vh',
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Notifications</span>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {unreadCount > 0 && (
              <IconButton
                onClick={handleMarkAllRead}
                sx={{
                  color: 'var(--darkteal)',
                  fontSize: '0.875rem',
                  padding: '4px 8px',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 128, 128, 0.1)',
                  }
                }}
                title="Mark all as read"
              >
                <Typography sx={{ fontSize: '0.75rem', fontFamily: 'Readex Pro, sans-serif' }}>
                  Mark all read
                </Typography>
              </IconButton>
            )}
            <IconButton
              onClick={handleNotificationsClose}
              sx={{
                color: 'var(--darkpurple)',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '16px', paddingBottom: '16px' }}>
          {notifications.length === 0 ? (
            <Typography
              sx={{
                fontFamily: 'Readex Pro, sans-serif',
                color: 'rgba(91, 10, 120, 0.6)',
                fontSize: '1rem',
                textAlign: 'center',
                padding: '2rem',
              }}
            >
              No notifications yet
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {notifications.map((notification) => (
                <Box
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: notification.isRead ? 'transparent' : 'rgba(91, 10, 120, 0.05)',
                    border: `1px solid ${notification.isRead ? 'rgba(91, 10, 120, 0.1)' : 'rgba(91, 10, 120, 0.2)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(91, 10, 120, 0.1)',
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: '4px' }}>
                    {notification.type === 'like' && (
                      <FavoriteIcon sx={{ color: 'var(--darkpurple)', fontSize: '1.1rem' }} />
                    )}
                    {notification.type === 'comment' && (
                      <ChatBubbleOutlineIcon sx={{ color: 'var(--darkpurple)', fontSize: '1.1rem' }} />
                    )}
                    {notification.type === 'reply' && (
                      <ReplyIcon sx={{ color: 'var(--darkpurple)', fontSize: '1.1rem' }} />
                    )}
                    {notification.type === 'comment_like' && (
                      <FavoriteIcon sx={{ color: 'var(--darkpurple)', fontSize: '1.1rem' }} />
                    )}
                    {notification.type === 'reply_like' && (
                      <FavoriteIcon sx={{ color: 'var(--darkpurple)', fontSize: '1.1rem' }} />
                    )}
                    <Typography
                      sx={{
                        fontFamily: 'Readex Pro, sans-serif',
                        color: 'var(--darkpurple)',
                        fontSize: '0.95rem',
                        fontWeight: notification.isRead ? 400 : 600,
                      }}
                    >
                      {notification.type === 'like' && (
                        <><strong>{notification.senderUsername}</strong> liked your review of <strong>{notification.bookTitle}</strong></>
                      )}
                      {notification.type === 'comment' && (
                        <><strong>{notification.senderUsername}</strong> commented on <strong>{notification.bookTitle}</strong></>
                      )}
                      {notification.type === 'reply' && (
                        <><strong>{notification.senderUsername}</strong> replied to your comment on <strong>{notification.bookTitle}</strong></>
                      )}
                      {notification.type === 'comment_like' && (
                        <><strong>{notification.senderUsername}</strong> liked your comment on <strong>{notification.bookTitle}</strong></>
                      )}
                      {notification.type === 'reply_like' && (
                        <><strong>{notification.senderUsername}</strong> liked your reply on <strong>{notification.bookTitle}</strong></>
                      )}
                    </Typography>
                  </Box>
                  {notification.commentText && (
                    <Typography
                      sx={{
                        fontFamily: 'Readex Pro, sans-serif',
                        color: 'rgba(91, 10, 120, 0.7)',
                        fontSize: '0.85rem',
                        fontStyle: 'italic',
                        marginTop: '4px',
                      }}
                    >
                      "{notification.commentText}"
                    </Typography>
                  )}
                  <Typography
                    sx={{
                      fontFamily: 'Readex Pro, sans-serif',
                      color: 'rgba(91, 10, 120, 0.5)',
                      fontSize: '0.75rem',
                      marginTop: '4px',
                    }}
                  >
                    {new Date(notification.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </AppBar>
  );
}

export default Navbar;
