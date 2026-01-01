import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getGuestBooks } from '../utils/guestStorage';
import { API_URL } from '../config';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookCard from '../components/BookCard';
import WoodTexture from '../assets/images/WoodPattern.svg';
import './Read.css';

const chunkArray = (array, size) => {
  let result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const Read = () => {
  const [books, setBooks] = useState([]);
  const { user } = useUser();
  const { username } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Fetch profile user data
  useEffect(() => {
    const fetchProfileUser = async () => {
      if (!username) return;

      // Handle guest user specially
      if (username === 'guest' && user?.isGuest) {
        setProfileUser({ username: 'guest', googleId: user.sub });
        setIsOwnProfile(true);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/users/username/${username}`);
        if (response.ok) {
          const userData = await response.json();
          setProfileUser(userData);

          // Check if viewing own profile
          if (user && user.username === userData.username) {
            setIsOwnProfile(true);
          } else {
            setIsOwnProfile(false);
          }
        }
      } catch (error) {
        console.error('Error fetching profile user:', error);
      }
    };

    fetchProfileUser();
  }, [username, user?.username, user?.isGuest, user?.sub]);

  const fetchBooks = async () => {
    if (!profileUser) return;

    // For guest users, load from localStorage
    if (profileUser.username === 'guest' && user?.isGuest) {
      const guestBooksObj = getGuestBooks();
      const transformedBooks = Object.values(guestBooksObj)
        .filter(book => book.category === 'read' && book.categoryDisplay === 'Read')
        .map((book) => ({
          id: book.googleBooksId,
          volumeInfo: {
            title: book.title,
            authors: book.authors,
            imageLinks: book.thumbnail ? { thumbnail: book.thumbnail } : undefined,
            publishedDate: book.publishedDate,
            description: book.description,
            pageCount: book.pageCount,
            categories: book.categories,
          },
          // Include guest book data for editing
          rating: book.rating,
          review: book.review,
          category: book.categoryDisplay,
        }));
      setBooks(transformedBooks);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/books/user/${profileUser.googleId}/category/Read`);
      const data = await response.json();

      // Transform MongoDB books to Google Books API format for BookCard
      const transformedBooks = data.map((book) => ({
        id: book.googleBooksId,
        volumeInfo: {
          title: book.title,
          authors: book.authors,
          imageLinks: book.thumbnail ? { thumbnail: book.thumbnail } : undefined,
          publishedDate: book.publishedDate,
          description: book.description,
          pageCount: book.pageCount,
          categories: book.categories,
        },
        // Include MongoDB data for editing
        _id: book._id,
        rating: book.rating,
        review: book.review,
        category: book.category,
      }));

      setBooks(transformedBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [profileUser]);

  useEffect(() => {
    if (profileUser && profileUser.username) {
      document.title = `Shelfie - @${profileUser.username}'s Read`;
    } else {
      document.title = "Shelfie";
    }
  }, [profileUser?.username]);

  const renderShelfRows = () => {
    // Split the books into chunks of 4
    const chunkedBooks = chunkArray(books, 4);

    return chunkedBooks.map((chunk, index) => (
      <div className="shelf-row" key={index}>
        {index !== 0 && (
          <div className="single-shelf">
            <div className="shelf-texture">
              <img src={WoodTexture} alt="Wood texture" />
            </div>
          </div>
        )}
        <div className="read-container">
          <BookCard books={chunk} onBookUpdate={fetchBooks} isOwnProfile={isOwnProfile} />
        </div>
      </div>
    ));
  };

  return (
    <>
      <IconButton
        className="read-back-btn"
        onClick={() => navigate(`/${username || ''}`)}
        sx={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          color: 'var(--darkpurple)',
          backgroundColor: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          },
          zIndex: 1000,
        }}
        title="Back to profile"
      >
        <ArrowBackIcon />
      </IconButton>

      <div className="top-container">
        <div className="shelf-texture">
          <img src={WoodTexture} alt="Wood texture" />
        </div>
        <h1 className="read-title">Read</h1>
      </div>

      <div className="shelf-flex">
        <div className="left-right">
          <div className="shelf-texture">
            <img src={WoodTexture} alt="Wood texture" />
          </div>
        </div>
        <div className="rows-container">
          {books.length > 0 ? (
            <div>
              {renderShelfRows()}
            </div>
          ) : (
            <div />
          )}
        </div>
        <div className="left-right">
          <div className="shelf-texture">
            <img src={WoodTexture} alt="Wood texture" />
          </div>
        </div>
      </div>

      <div className="top-container">
        <div className="shelf-texture">
          <img src={WoodTexture} alt="Wood texture" />
        </div>
      </div>
    </>
  );
};

export default Read;
