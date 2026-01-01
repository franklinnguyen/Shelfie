import { Dialog, DialogContent, DialogActions, Button, Typography, Box, Select, MenuItem, FormControl, InputLabel, TextField, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { getGuestBook, saveGuestBook, removeGuestBook } from "../utils/guestStorage";
import { API_URL } from "../config";
import "./BookPopup.css";
import greyStarIcon from "../assets/icons/GreyStar.svg";
import yellowStarIcon from "../assets/icons/YellowStar.svg";

const BookPopup = ({ open, book, onClose, isOwnProfile = true }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { user } = useUser();

  // Check if this book is already saved (has MongoDB _id and category OR in guest localStorage)
  const isBookSaved = book?._id && book?.category;

  // Initialize form with existing book data when popup opens
  useEffect(() => {
    if (open && book) {
      // For guest mode, check localStorage
      if (user?.isGuest && book.id) {
        const guestBook = getGuestBook(book.id);
        if (guestBook) {
          setSelectedCategory(guestBook.category || '');
          setRating(guestBook.rating || 0);
          setReview(guestBook.review || '');
          return;
        }
      }

      // For regular users or if no guest data, use book data
      if (isBookSaved) {
        setSelectedCategory(
          book.category === 'To Be Read' ? 'to-be-read' :
          book.category === 'Currently Reading' ? 'currently-reading' :
          book.category === 'Read' ? 'read' : ''
        );
        setRating(book.rating || 0);
        setReview(book.review || '');
      }
    }
  }, [open, book, isBookSaved, user?.isGuest]);

  if (!book) return null;

  const title = book.volumeInfo.title;
  const thumbnail = book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail;
  const authors = book.volumeInfo.authors;
  const authorNames = authors ? authors.join(", ") : "Unknown Author";
  const description = book.volumeInfo.description || "No description available.";
  const previewLink = book.volumeInfo.previewLink;

  // Enhance thumbnail URL with fife parameter for higher quality
  let enhancedThumbnail = thumbnail;
  if (thumbnail) {
    enhancedThumbnail = thumbnail
      .replace('http://', 'https://')
      .replace(/&?edge=curl/, '');
    if (!enhancedThumbnail.includes('fife=')) {
      enhancedThumbnail += '&fife=w400';
    }
  }

  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;
    setSelectedCategory(newCategory);

    // Clear rating and review when switching from 'read' to another category
    if (selectedCategory === 'read' && newCategory !== 'read') {
      setRating(0);
      setReview('');
    }
  };

  const handleSave = async () => {
    if (!user) {
      console.error('No user logged in!');
      onClose();
      return;
    }

    // For guest mode, save to localStorage
    if (user.isGuest) {
      const categoryMap = {
        'to-be-read': 'To Be Read',
        'currently-reading': 'Currently Reading',
        'read': 'Read',
      };

      // If no category selected, remove from localStorage
      if (!selectedCategory) {
        if (book.id) {
          removeGuestBook(book.id);
        }
        setSelectedCategory("");
        setReview("");
        setRating(0);
        setHoveredRating(0);
        onClose();
        return;
      }

      // Require rating when saving to "Read" category
      if (selectedCategory === 'read' && rating === 0) {
        alert('Please add a rating before saving to Read');
        return;
      }

      // Save to localStorage with full book metadata
      const guestBookData = {
        googleBooksId: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors || [],
        thumbnail: book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail,
        publishedDate: book.volumeInfo.publishedDate,
        description: book.volumeInfo.description,
        pageCount: book.volumeInfo.pageCount,
        categories: book.volumeInfo.categories || [],
        category: selectedCategory,
        categoryDisplay: categoryMap[selectedCategory],
        rating: rating || 0,
        review: review || '',
      };

      saveGuestBook(book.id, guestBookData);

      // Reset form
      setSelectedCategory("");
      setReview("");
      setRating(0);
      setHoveredRating(0);
      onClose();
      return;
    }

    // If no category selected and book is saved, remove it
    if (!selectedCategory && isBookSaved) {
      await handleRemove();
      return;
    }

    // If no category selected and book is not saved, just close
    if (!selectedCategory) {
      onClose();
      return;
    }

    // Require rating when saving to "Read" category
    if (selectedCategory === 'read' && rating === 0) {
      alert('Please add a rating before saving to Read');
      return;
    }

    try {
      const categoryMap = {
        'to-be-read': 'To Be Read',
        'currently-reading': 'Currently Reading',
        'read': 'Read',
      };

      if (isBookSaved) {
        // Update existing book
        const updateData = {
          category: categoryMap[selectedCategory],
          rating: rating || 0,
          review: review || '',
        };

        const response = await fetch(`${API_URL}/api/books/${book._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        if (response.ok) {
          console.log('Book updated successfully!');
        } else {
          const error = await response.json();
          console.error('Error updating book:', error.message);
        }
      } else {
        // Create new book
        const bookData = {
          userId: user.sub,
          googleBooksId: book.id,
          title: book.volumeInfo.title,
          authors: book.volumeInfo.authors || [],
          thumbnail: book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail,
          publishedDate: book.volumeInfo.publishedDate,
          description: book.volumeInfo.description,
          pageCount: book.volumeInfo.pageCount,
          categories: book.volumeInfo.categories || [],
          category: categoryMap[selectedCategory],
          rating: rating || 0,
          review: review || '',
        };

        const response = await fetch(`${API_URL}/api/books`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookData),
        });

        if (response.ok) {
          console.log('Book saved successfully!');
        } else {
          const error = await response.json();
          console.error('Error saving book:', error.message);
        }
      }
    } catch (error) {
      console.error('Error saving book:', error);
    }

    // Reset form
    setSelectedCategory("");
    setReview("");
    setRating(0);
    setHoveredRating(0);
    onClose();
  };

  const handleRemove = async () => {
    if (!isBookSaved || !user) {
      onClose();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/books/${book._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Book removed successfully!');
      } else {
        const error = await response.json();
        console.error('Error removing book:', error.message);
      }
    } catch (error) {
      console.error('Error removing book:', error);
    }

    // Reset form
    setSelectedCategory("");
    setReview("");
    setRating(0);
    setHoveredRating(0);
    onClose();
  };

  const handleClose = () => {
    // Reset form without saving
    setSelectedCategory("");
    setReview("");
    setRating(0);
    setHoveredRating(0);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          backgroundColor: 'var(--darkteal)',
          position: 'relative',
        }
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'white',
          zIndex: 1,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ padding: '32px' }}>
        <Box sx={{ display: 'flex', gap: '24px', flexDirection: { xs: 'column', sm: 'row' } }}>
          {/* Book Cover */}
          <Box sx={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src={enhancedThumbnail}
              alt={title}
              style={{
                maxWidth: '200px',
                maxHeight: '400px',
                width: 'auto',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              }}
            />
          </Box>

          {/* Book Info */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Readex Pro, sans-serif',
                fontWeight: 700,
                color: 'white',
                fontSize: { xs: '1.5rem', sm: '2rem' },
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Readex Pro, sans-serif',
                fontWeight: 400,
                color: 'white',
                fontSize: '1.1rem',
                opacity: 0.9,
              }}
            >
              By {authorNames}
            </Typography>

            {/* Category Selection */}
            {isOwnProfile && (
            <FormControl fullWidth sx={{ marginTop: '8px' }}>
              <InputLabel
                sx={{
                  fontFamily: 'Readex Pro, sans-serif',
                  color: 'white',
                  '&.Mui-focused': { color: 'white' },
                }}
              >
                {isBookSaved ? 'Change Category' : 'Add to Category'}
              </InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label={isBookSaved ? 'Change Category' : 'Add to Category'}
                sx={{
                  fontFamily: 'Readex Pro, sans-serif',
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  },
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="to-be-read">To Be Read</MenuItem>
                <MenuItem value="currently-reading">Currently Reading</MenuItem>
                <MenuItem value="read">Read</MenuItem>
              </Select>
            </FormControl>
            )}

            {/* Description or Review Input */}
            {isOwnProfile && selectedCategory === 'read' ? (
              <Box sx={{ marginTop: '8px' }}>
                {/* Star Rating */}
                <Box sx={{ marginBottom: '16px', position: 'relative' }}>
                  <Box
                    component="fieldset"
                    sx={{
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '4px',
                      padding: '16px',
                      margin: 0,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        borderColor: 'white',
                      },
                    }}
                  >
                    <Box
                      component="legend"
                      sx={{
                        fontFamily: 'Readex Pro, sans-serif',
                        fontSize: '0.75rem',
                        color: 'white',
                        padding: '0 4px',
                      }}
                    >
                      Rating
                    </Box>
                    <Box sx={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <img
                          key={star}
                          src={star <= (hoveredRating || rating) ? yellowStarIcon : greyStarIcon}
                          alt={`Star ${star}`}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          style={{
                            cursor: 'pointer',
                            width: '32px',
                            height: '32px',
                            transition: 'transform 0.2s ease',
                          }}
                          onMouseOver={(e) => e.target.style.transform = 'scale(1.2)'}
                          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>

                {/* Review Text Box */}
                <TextField
                  label="Write a Review"
                  multiline
                  rows={6}
                  fullWidth
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="What did you think of this book?"
                  sx={{
                    fontFamily: 'Readex Pro, sans-serif',
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'Readex Pro, sans-serif',
                      backgroundColor: review ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'white',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'white',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: 'Readex Pro, sans-serif',
                      color: 'white',
                      '&.Mui-focused': {
                        color: 'white',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.6)',
                      opacity: 1,
                    },
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ marginTop: '8px' }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Readex Pro, sans-serif',
                    fontWeight: 600,
                    color: 'white',
                    marginBottom: '8px',
                  }}
                >
                  Description:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Readex Pro, sans-serif',
                    color: 'white',
                    opacity: 0.9,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    lineHeight: 1.6,
                  }}
                >
                  {description}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: '16px 32px', gap: '12px', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: '12px' }}>
          {previewLink && (
            <Button
              href={previewLink}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                fontFamily: 'Readex Pro, sans-serif',
                fontWeight: 600,
                color: 'white',
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              More Info
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: '12px' }}>
          {isOwnProfile && isBookSaved && (
            <Button
              onClick={handleRemove}
              sx={{
                fontFamily: 'Readex Pro, sans-serif',
                fontWeight: 600,
                backgroundColor: 'var(--lightteal)',
                color: 'white',
                textTransform: 'none',
                fontSize: '1rem',
                padding: '8px 24px',
                '&:hover': {
                  backgroundColor: 'var(--lightteal)',
                  opacity: 0.9,
                },
              }}
            >
              Remove
            </Button>
          )}
          {isOwnProfile && (
          <Button
            onClick={handleSave}
            sx={{
              fontFamily: 'Readex Pro, sans-serif',
              fontWeight: 600,
              backgroundColor: 'var(--darkpurple)',
              color: 'white',
              textTransform: 'none',
              fontSize: '1rem',
              padding: '8px 24px',
              '&:hover': {
                backgroundColor: 'var(--darkpurple)',
                opacity: 0.9,
              },
            }}
          >
            Save
          </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default BookPopup;
