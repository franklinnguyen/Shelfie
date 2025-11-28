import { AppBar, Toolbar, Box, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
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

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    googleLogout();
    navigate('/login');
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
            src={isActive('/room') ? tealRoomIcon : roomIcon}
            alt="RoomIcon"
            className="navbar-icon"
            onClick={() => navigate('/room')}
          />
        </Box>
        <Button
          onClick={handleLogout}
          className="logout-button"
          sx={{
            marginLeft: 'auto',
            color: 'var(--darkpurple)',
            fontFamily: 'Readex Pro, sans-serif',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'transparent',
              opacity: 0.7,
              transform: 'scale(1.05)',
            },
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
