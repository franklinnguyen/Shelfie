import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Room from './pages/Room';
import SearchBooks from './pages/SearchBooks';
import SearchFriends from './pages/SearchFriends';
import Login from './pages/Login';
import ToBeRead from './pages/ToBeRead';
import CurrentlyReading from './pages/CurrentlyReading';
import Read from './pages/Read';

// Protected Route component - redirects to login if not authenticated
function ProtectedRoute({ children }) {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Catch-all redirect - sends to home if logged in, login if not
function NotFoundRedirect() {
  const { user } = useUser();
  return <Navigate to={user ? "/" : "/login"} replace />;
}

// Login redirect - sends logged-in users to home
function LoginRoute() {
  const { user } = useUser();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Login />;
}

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname.includes('/to-be-read') || location.pathname.includes('/read') || location.pathname.includes('/currently-reading');

  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginRoute />} />

        {/* Protected main routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/search-books" element={<ProtectedRoute><SearchBooks /></ProtectedRoute>} />
        <Route path="/search-friends" element={<ProtectedRoute><SearchFriends /></ProtectedRoute>} />

        {/* Protected user routes - these need to be after specific routes but before catch-all */}
        <Route path="/:username/to-be-read" element={<ProtectedRoute><ToBeRead /></ProtectedRoute>} />
        <Route path="/:username/currently-reading" element={<ProtectedRoute><CurrentlyReading /></ProtectedRoute>} />
        <Route path="/:username/read" element={<ProtectedRoute><Read /></ProtectedRoute>} />
        <Route path="/:username" element={<ProtectedRoute><Room /></ProtectedRoute>} />

        {/* Catch-all route - redirects to home if logged in, login if not */}
        <Route path="*" element={<NotFoundRedirect />} />
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
