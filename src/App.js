import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Room from './pages/Room';
import SearchBooks from './pages/SearchBooks';
import SearchFriends from './pages/SearchFriends';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room" element={<Room />} />
          <Route path="/search-books" element={<SearchBooks />} />
          <Route path="/search-friends" element={<SearchFriends />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
