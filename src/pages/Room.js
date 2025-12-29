// src/pages/Room.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Room.css';
import roomBox from '../assets/images/RoomBox.svg';
import roomShelf from '../assets/images/RoomShelf.svg';
import roomTable from '../assets/images/RoomTable.svg';

function Room() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('Welcome to Shelfie!');
  const [numFriends, setNumFriends] = useState(0);
  const [numFollowing, setNumFollowing] = useState(0);
  const [profilePicture, setProfilePicture] = useState('');

  useEffect(() => {
    if (user) {
      // Generate default username from Google account name + random identifier
      const generateUsername = () => {
        const firstName = user.given_name || '';
        const lastName = user.family_name || '';
        const randomId = Math.floor(Math.random() * 10000);
        return `${firstName}${lastName}${randomId}`.toLowerCase().replace(/\s+/g, '');
      };

      setUsername(user.username || generateUsername());
      setBio(user.bio || 'Welcome to Shelfie!');
      setNumFriends(user.num_friends || 0);
      setNumFollowing(user.num_following || 0);
      setProfilePicture(user.picture || '');
    }
  }, [user]);

  return (
    <div className="room-page">
      {/* Profile Section */}
      <div className="room-profile-section">
        <div className="room-profile-picture">
          {profilePicture && (
            <img src={profilePicture} alt="Profile" />
          )}
        </div>
        <div className="room-profile-info">
          <h2 className="room-username">@{username}</h2>
          <div className="room-stats">
            <span className="room-stat-item">{numFriends} Friends</span>
            <span className="room-stat-divider">•</span>
            <span className="room-stat-item">{numFollowing} Following</span>
          </div>
          <p className="room-bio">{bio}</p>
        </div>
      </div>

      <div className="room-content">
        <div className="furniture-item">
          <img
            src={roomBox}
            alt="Box"
            className="room-box-image"
            onClick={() => navigate('/to-be-read')}
            style={{ cursor: 'pointer' }}
          />
          <button
            className="navigation-button"
            onClick={() => navigate('/to-be-read')}
          >
            To Be Read
          </button>
        </div>

        <div className="furniture-item">
          <img
            src={roomTable}
            alt="Table"
            className="room-table-image"
            onClick={() => navigate('/currently-reading')}
            style={{ cursor: 'pointer' }}
          />
          <button
            className="navigation-button"
            onClick={() => navigate('/currently-reading')}
          >
            Currently Reading
          </button>
        </div>

        <div className="furniture-item">
          <img
            src={roomShelf}
            alt="Bookshelf"
            className="room-shelf-image"
            onClick={() => navigate('/read')}
            style={{ cursor: 'pointer' }}
          />
          <button
            className="navigation-button"
            onClick={() => navigate('/read')}
          >
            Read
          </button>
        </div>
      </div>

      <div className="room-background" />
      <div className="room-floor" />
    </div>
  );
}

export default Room;