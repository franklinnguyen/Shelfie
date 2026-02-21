import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getGuestBooks } from '../utils/guestStorage';
import { API_URL } from '../config';
import { IconButton } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import BookCard from '../components/BookCard';
import './ToBeRead.css';

const ToBeRead = () => {
  const [books, setBooks] = useState([]);
  const { user } = useUser();
  const { username } = useParams();
  const navigate = useNavigate();
  const redirectTimerRef = useRef(null);
  const [profileUser, setProfileUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scheduleRedirect = useCallback((path) => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }
    redirectTimerRef.current = setTimeout(() => {
      navigate(path, { replace: true });
    }, 220);
  }, [navigate]);

  useEffect(() => {
    const fetchProfileUser = async () => {
      if (!username) return;

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

          if (user && user.username === userData.username) {
            setIsOwnProfile(true);
          } else {
            setIsOwnProfile(false);
          }
        } else if (user?.sub) {
          const selfResponse = await fetch(`${API_URL}/api/users/${user.sub}`);
          if (selfResponse.ok) {
            const selfUser = await selfResponse.json();
            if (selfUser?.username && selfUser.username !== username) {
              scheduleRedirect(`/${selfUser.username}/to-be-read`);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile user:', error);
      }
    };

    fetchProfileUser();
  }, [username, user?.username, user?.isGuest, user?.sub, navigate, scheduleRedirect]);

  useEffect(() => {
    if (isOwnProfile && user?.username && username && username !== user.username) {
      scheduleRedirect(`/${user.username}/to-be-read`);
    }
  }, [isOwnProfile, user?.username, username, navigate, scheduleRedirect]);

  const fetchBooks = async () => {
    if (!profileUser) return;

    // For guest users, load from localStorage
    if (profileUser.username === 'guest' && user?.isGuest) {
      const guestBooksObj = getGuestBooks();
      const transformedBooks = Object.values(guestBooksObj)
        .filter(book => book.category === 'to-be-read' && book.categoryDisplay === 'To Be Read')
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
      const response = await fetch(`${API_URL}/api/books/user/${profileUser.googleId}/category/To Be Read`);
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
      document.title = `Shelfie - @${profileUser.username}'s To Be Read`;
    } else {
      document.title = "Shelfie";
    }
  }, [profileUser?.username]);

  return (
    <>
      <IconButton
        className="shelf-back-btn"
        onClick={() => navigate(`/${(isOwnProfile && user?.username) ? user.username : (profileUser?.username || username || '')}`)}
        title="Back to profile"
      >
        <ArrowBackRoundedIcon />
      </IconButton>

      <div className="everything">
        <div className="toptbr-container">
          <h1 className="shelf-title">To Be Read</h1>
        </div>

        <div className="lefttbr-container"></div>
        <div className="righttbr-container"></div>

        <div className="tbr-outer">
          <div className="tbr-container">
            <BookCard books={books} onBookUpdate={fetchBooks} isOwnProfile={isOwnProfile} />
          </div>
        </div>

        <div className="bottomtbr-container"></div>
      </div>
    </>
  );
};

export default ToBeRead;
