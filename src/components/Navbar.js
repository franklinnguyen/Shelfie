import { AppBar, Toolbar, Box, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
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
          onClick={handleLogout}
          className="logout-button"
          sx={{
            marginLeft: 'auto',
            color: 'var(--darkpurple)',
            '&:hover': {
              backgroundColor: 'rgba(91, 10, 120, 0.1)',
            },
          }}
          title="Logout"
        >
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
