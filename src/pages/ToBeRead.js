import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import BookCard from '../components/BookCard';
import './ToBeRead.css';

const ToBeRead = () => {
  const [books, setBooks] = useState([]);
  const { user } = useUser();
  const navigate = useNavigate();

  const fetchBooks = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:5001/api/books/user/${user.sub}/category/To Be Read`);
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
  }, [user]);

  useEffect(() => {
    if (user && user.username) {
      document.title = `Shelfie - @${user.username}'s To Be Read`;
    } else {
      document.title = "Shelfie";
    }
  }, [user?.username]);

  return (
    <>
      <button className="back-btn" onClick={() => navigate(`/${user?.username || ''}`)}>
        Back
      </button>

      <div className="everything">
        <div className="toptbr-container">
          <h1 className="tbr-title">To Be Read</h1>
        </div>

        <div className="lefttbr-container"></div>
        <div className="righttbr-container"></div>

        <div className="tbr-outer">
          <div className="tbr-container">
            <BookCard books={books} onBookUpdate={fetchBooks} />
          </div>
        </div>

        <div className="bottomtbr-container"></div>
      </div>
    </>
  );
};

export default ToBeRead;
