import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Room from './pages/Room';
import SearchBooks from './pages/SearchBooks';
import SearchFriends from './pages/SearchFriends';
import Login from './pages/Login';
import ToBeRead from './pages/ToBeRead';
import CurrentlyReading from './pages/CurrentlyReading';
import Read from './pages/Read';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname.includes('/to-be-read') || location.pathname.includes('/read') || location.pathname.includes('/currently-reading');

  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search-books" element={<SearchBooks />} />
        <Route path="/search-friends" element={<SearchFriends />} />
        <Route path="/login" element={<Login />} />
        <Route path="/:username" element={<Room />} />
        <Route path="/:username/to-be-read" element={<ToBeRead />} />
        <Route path="/:username/currently-reading" element={<CurrentlyReading />} />
        <Route path="/:username/read" element={<Read />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
