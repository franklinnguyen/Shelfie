import { Dialog, DialogContent, DialogActions, Button, Typography, Box, Select, MenuItem, FormControl, InputLabel, TextField } from "@mui/material";
import { useState } from "react";
import "./BookPopup.css";

const BookPopup = ({ open, book, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [review, setReview] = useState("");

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
    // TODO: Will implement actual saving later
    console.log(`Selected category: ${event.target.value} for book: ${title}`);
  };

  const handleSave = () => {
    // TODO: Will implement actual saving later
    console.log(`Saving - Category: ${selectedCategory}, Review: ${review}`);
    setSelectedCategory("");
    setReview("");
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
          backgroundColor: 'var(--lightpurple)',
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
                color: 'var(--darkpurple)',
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
                color: 'var(--darkpurple)',
                fontSize: '1.1rem',
                opacity: 0.8,
              }}
            >
              By {authorNames}
            </Typography>

            {/* Category Selection */}
            <FormControl fullWidth sx={{ marginTop: '8px' }}>
              <InputLabel
                sx={{
                  fontFamily: 'Readex Pro, sans-serif',
                  color: 'var(--darkpurple)',
                  '&.Mui-focused': { color: 'var(--darkpurple)' },
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
                  color: 'var(--darkpurple)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--darkpurple)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--darkpurple)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--darkpurple)',
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
                      '& fieldset': {
                        borderColor: 'var(--darkpurple)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--darkpurple)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--darkpurple)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: 'Readex Pro, sans-serif',
                      color: 'var(--darkpurple)',
                      '&.Mui-focused': {
                        color: 'var(--darkpurple)',
                      },
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
                    color: 'var(--darkpurple)',
                    marginBottom: '8px',
                  }}
                >
                  Description:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'Readex Pro, sans-serif',
                    color: 'var(--darkpurple)',
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
              color: 'var(--darkpurple)',
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: 'rgba(91, 10, 120, 0.1)',
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
