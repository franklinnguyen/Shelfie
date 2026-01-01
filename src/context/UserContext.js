import { createContext, useState, useContext, useEffect } from 'react';
import { clearGuestStorage } from '../utils/guestStorage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize from localStorage
    const savedUser = localStorage.getItem('shelfie_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Save to localStorage whenever user changes (but not for guest mode)
  useEffect(() => {
    if (user && !user.isGuest) {
      localStorage.setItem('shelfie_user', JSON.stringify(user));
    } else if (!user) {
      localStorage.removeItem('shelfie_user');
    }
  }, [user]);

  const enterGuestMode = async () => {
    try {
      // Fetch all users to auto-follow them
      const response = await fetch('http://localhost:5001/api/users/all');
      if (response.ok) {
        const allUsers = await response.json();
        const allUsernames = allUsers.map(u => u.username);

        // Create a guest user that follows everyone
        const guestUser = {
          sub: 'guest_' + Date.now(),
          username: 'guest',
          name: 'Guest User',
          email: 'guest@shelfie.com',
          picture: null,
          following: allUsernames,
          followers: [],
          isGuest: true
        };

        setUser(guestUser);
        return true; // Return success
      }
      return false;
    } catch (error) {
      console.error('Error entering guest mode:', error);
      return false;
    }
  };

  const exitGuestMode = () => {
    // Clear all guest data from localStorage
    clearGuestStorage();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, enterGuestMode, exitGuestMode }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
