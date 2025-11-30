// src/pages/Room.js
import { useNavigate } from 'react-router-dom';
import './Room.css';
import roomBox from '../assets/images/RoomBox.svg';
import roomShelf from '../assets/images/RoomShelf.svg';
import roomTable from '../assets/images/RoomTable.svg';

function Room() {
  const navigate = useNavigate();

  return (
    <div className="room-page">
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