const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Get all books for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const books = await Book.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get books by category for a user
router.get('/user/:userId/category/:category', async (req, res) => {
  try {
    const books = await Book.find({
      userId: req.params.userId,
      category: req.params.category,
    }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a book
router.post('/', async (req, res) => {
  const book = new Book({
    userId: req.body.userId,
    googleBooksId: req.body.googleBooksId,
    title: req.body.title,
    authors: req.body.authors,
    thumbnail: req.body.thumbnail,
    publishedDate: req.body.publishedDate,
    description: req.body.description,
    pageCount: req.body.pageCount,
    categories: req.body.categories,
    category: req.body.category,
    rating: req.body.rating || 0,
    review: req.body.review || '',
  });

  try {
    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate book error
      res.status(400).json({ message: 'Book already exists in your library' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

// Update a book
router.patch('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Update fields
    if (req.body.category != null) book.category = req.body.category;
    if (req.body.rating != null) book.rating = req.body.rating;
    if (req.body.review != null) book.review = req.body.review;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a book
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await book.deleteOne();
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
