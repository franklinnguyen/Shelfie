import { AppBar, Toolbar, Box } from '@mui/material';
import './Navbar.css';
import shelfieWideLogo from '../assets/images/ShelfieWideLogo.svg';
import roomIcon from '../assets/icons/RoomIcon.svg';
import homeIcon from '../assets/icons/HomeIcon.svg';
import searchIcon from '../assets/icons/SearchIcon.svg';

function Navbar() {
  return (
    <AppBar position="static" className="navbar">
      <Toolbar>
        <img
          src={shelfieWideLogo}
          alt="Shelfie Wide Logo"
          className="shelfie-wide-logo"
        />
        <Box className="navbar-icons">
          <img src={homeIcon} alt="HomeIcon" className="navbar-icon" />
          <img src={searchIcon} alt="SearchIcon" className="navbar-icon" />
          <img src={roomIcon} alt="RoomIcon" className="navbar-icon" />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
