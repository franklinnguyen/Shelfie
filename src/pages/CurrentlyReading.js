import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getGuestBooks } from '../utils/guestStorage';
import { API_URL } from '../config';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookCard from '../components/BookCard';
import WoodTexture from '../assets/images/WoodPattern.svg';
import './CurrentlyReading.css';

const CurrentlyReading = () => {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useUser();
  const { username } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const booksPerPage = 3;

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
        .filter(book => book.category === 'currently-reading' && book.categoryDisplay === 'Currently Reading')
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
      const response = await fetch(`${API_URL}/api/books/user/${profileUser.googleId}/category/Currently Reading`);
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
      document.title = `Shelfie - @${profileUser.username}'s Currently Reading`;
    } else {
      document.title = "Shelfie";
    }
  }, [profileUser?.username]);

  // Calculate pagination
  const totalPages = Math.ceil(books.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const currentBooks = books.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <>
      <IconButton
        className="curr-back-btn"
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

      {books.length > booksPerPage && (
        <div className="pagination-controls">
          <button
            className="pagination-arrow"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            ←
          </button>
          <span className="pagination-text">
            {currentPage} / {totalPages}
          </span>
          <button
            className="pagination-arrow"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            →
          </button>
        </div>
      )}

      <div className="currtop-container">
        <h1 className="curr-title">Currently Reading</h1>
      </div>

      <div className="curr-container">
        <div className="circle">
          <div className="woodstyling">
            <img src={WoodTexture} alt="Wood texture" />
          </div>
          <div className="currbooks-container">
            <BookCard books={currentBooks} onBookUpdate={fetchBooks} isOwnProfile={isOwnProfile} />
          </div>
        </div>
      </div>
    </>
  );
};

export default CurrentlyReading;
