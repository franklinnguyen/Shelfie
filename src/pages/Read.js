import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
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
  const navigate = useNavigate();

  const fetchBooks = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:5001/api/books/user/${user.sub}/category/Read`);
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
    document.title = "Read";
  }, []);

  const renderShelfRows = () => {
    // Split the books into chunks of 3
    const chunkedBooks = chunkArray(books, 3);

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
          <BookCard books={chunk} onBookUpdate={fetchBooks} />
        </div>
      </div>
    ));
  };

  return (
    <>
      <button className="read-back-btn" onClick={() => navigate('/room')}>
        Back
      </button>

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
