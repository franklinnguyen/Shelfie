// src/pages/Room.js
import './Room.css';
import roomBox from '../assets/images/RoomBox.svg';
import roomShelf from '../assets/images/RoomShelf.svg';
import roomTable from '../assets/images/RoomTable.svg';

function Room() {
  return (
    <div className="room-page">
      <div className="room-content">
        <div className="furniture-item">
          <img src={roomBox} alt="Box" className="room-box-image" />
          <button className="navigation-button">to be read</button>
        </div>

        <div className="furniture-item">
          <img src={roomTable} alt="Table" className="room-table-image" />
          <button className="navigation-button">currently reading</button>
        </div>

        <div className="furniture-item">
          <img src={roomShelf} alt="Bookshelf" className="room-shelf-image" />
          <button className="navigation-button">read</button>
        </div>
      </div>

      <div className="room-background" />
      <div className="room-floor" />
    </div>
  );
}

export default Room;