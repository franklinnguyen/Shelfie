// src/pages/Room.js
import './Room.css';
import roomBox from '../assets/images/RoomBox.svg';
import roomShelf from '../assets/images/RoomShelf.svg';
import roomTable from '../assets/images/RoomTable.svg';

function Room() {
  return (
    <div className="room-page">
      <div className="room-content">
        <img src={roomBox} alt="Box" className="room-box-image" />
        <img src={roomTable} alt="Table" className="room-table-image" />
        <img src={roomShelf} alt="Bookshelf" className="room-shelf-image" />
      </div>

      <div className="room-background" />
      <div className="room-floor" />
    </div>
  );
}

export default Room;