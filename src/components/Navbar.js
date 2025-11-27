import { AppBar, Toolbar, Box } from '@mui/material';
import './Navbar.css';
import shelfieWideLogo from '../assets/images/ShelfieWideLogo.svg';
import shelfieSquareLogo from '../assets/images/ShelfieSquareLogo.svg';
import roomIcon from '../assets/icons/RoomIcon.svg';
import addIcon from '../assets/icons/AddIcon.svg';
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
        <img
          src={shelfieSquareLogo}
          alt="Shelfie Square Logo"
          className="shelfie-square-logo"
        />
        <Box className="navbar-icons">
          <img src={homeIcon} alt="HomeIcon" className="navbar-icon" />
          <img src={searchIcon} alt="SearchIcon" className="navbar-icon" />
          <img src={addIcon} alt="AddIcon" className="navbar-icon" />
          <img src={roomIcon} alt="RoomIcon" className="navbar-icon" />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
