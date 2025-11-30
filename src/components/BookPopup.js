import { Dialog, DialogContent, DialogActions, Button, Typography, Box, Select, MenuItem, FormControl, InputLabel, TextField } from "@mui/material";
import { useState } from "react";
import { useUser } from "../context/UserContext";
import "./BookPopup.css";
import greyStarIcon from "../assets/icons/GreyStar.svg";
import yellowStarIcon from "../assets/icons/YellowStar.svg";

const BookPopup = ({ open, book, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { user } = useUser();

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
    setSelectedCategory(event.target.value);
  };

  const handleSave = async () => {
    console.log('handleSave called');
    console.log('selectedCategory:', selectedCategory);
    console.log('user:', user);

    if (!selectedCategory) {
      console.log('No category selected, closing popup');
      onClose();
      return;
    }

    if (!user) {
      console.error('No user logged in!');
      alert('Please log in to save books');
      onClose();
      return;
    }

    try {
      // Map category values to match database schema
      const categoryMap = {
        'to-be-read': 'To Be Read',
        'currently-reading': 'Currently Reading',
        'read': 'Read',
      };

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

      console.log('Sending book data:', bookData);

      const response = await fetch('http://localhost:5001/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Book saved successfully!', data);
      } else {
        const error = await response.json();
        console.error('Error saving book:', error.message);
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

  return (
    <Dialog
      open={open}
      onClose={handleSave}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          backgroundColor: 'var(--darkteal)',
        }
      }}
    >
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
            <FormControl fullWidth sx={{ marginTop: '8px' }}>
              <InputLabel
                sx={{
                  fontFamily: 'Readex Pro, sans-serif',
                  color: 'white',
                  '&.Mui-focused': { color: 'white' },
                }}
              >
                Add to Category
              </InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Add to Category"
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

            {/* Description or Review Input */}
            {selectedCategory === 'read' ? (
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

      <DialogActions sx={{ padding: '16px 32px', gap: '12px' }}>
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
      </DialogActions>
    </Dialog>
  );
};

export default BookPopup;
