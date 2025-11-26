import { AppBar, Toolbar, Typography, Button } from '@mui/material';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Shelfie
        </Typography>
        <Button color="inherit">Home</Button>
        <Button color="inherit">Library</Button>
        <Button color="inherit">Profile</Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;