import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import BookCard from '../components/BookCard';
import WoodTexture from '../assets/images/WoodPattern.svg';
import './CurrentlyReading.css';

const CurrentlyReading = () => {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useUser();
  const navigate = useNavigate();
  const booksPerPage = 3;

  const fetchBooks = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:5001/api/books/user/${user.sub}/category/Currently Reading`);
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
    document.title = "Currently Reading";
  }, []);

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
      <button className="curr-back-btn" onClick={() => navigate('/room')}>
        Back
      </button>

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
            <BookCard books={currentBooks} onBookUpdate={fetchBooks} />
          </div>
        </div>
      </div>
    </>
  );
};

export default CurrentlyReading;
