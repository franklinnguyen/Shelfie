import { useState } from 'react';
import { AppBar, Toolbar, Box, IconButton, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useLocation } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import { useUser } from '../context/UserContext';
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

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

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

  return (
    <AppBar position="static" className="navbar" disableRipple>
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
            of 89 competing teams. Since the competition concluded, Franklin continued meticulously refining the
            platform, adding new features, and enhancing the user experience to create the polished reading companion
            you see today.
          </Typography>
        </DialogContent>
      </Dialog>
    </AppBar>
  );
}

export default Navbar;
