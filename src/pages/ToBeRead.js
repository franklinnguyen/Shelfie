import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useUser } from '../context/UserContext';
import BookCard from '../components/BookCard';
import './ToBeRead.css';

const ToBeRead = () => {
  const [books, setBooks] = useState([]);
  const { user } = useUser();

  useEffect(() => {
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

    fetchBooks();
  }, [user]);

  return (
    <Box className="to-be-read-container">
      <Typography
        variant="h4"
        className="page-title"
        sx={{
          fontFamily: 'Readex Pro, sans-serif',
          fontWeight: 700,
          color: 'var(--darkpurple)',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        To Be Read
      </Typography>
      <Box className="books-grid">
        <BookCard books={books} />
      </Box>
    </Box>
  );
};

export default ToBeRead;
