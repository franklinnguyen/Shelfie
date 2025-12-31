import { Card, CardMedia, CardContent, Typography, Box } from "@mui/material";
import { useState } from "react";
import BookPopup from "./BookPopup";
import "./BookCard.css";
import yellowStarIcon from "../assets/icons/YellowStar.svg";
import greyStarIcon from "../assets/icons/GreyStar.svg";

const BookCard = ({ books, onBookUpdate, isOwnProfile = true }) => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const handleCardClick = (book) => {
    setSelectedBook(book);
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setSelectedBook(null);
    // Trigger refresh of book list if callback provided
    if (onBookUpdate) {
      onBookUpdate();
    }
  };

  return (
    <>
      {books.map((item) => {
        // Get highest quality image available
        let thumbnail = null;
        let smallThumbnailUrl = null;
        if (item.volumeInfo.imageLinks) {
          const images = item.volumeInfo.imageLinks;

          // Store the smallThumbnail as absolute last resort
          if (images.smallThumbnail) {
            smallThumbnailUrl = images.smallThumbnail
              .replace('http://', 'https://')
              .replace(/&?edge=curl/, '');
          }

          // Try each quality level from highest to lowest, using whichever exists
          thumbnail = images.extraLarge ||
                      images.large ||
                      images.medium ||
                      images.small ||
                      images.thumbnail ||
                      images.smallThumbnail;

          // Upgrade image quality through URL manipulation
          if (thumbnail) {
            // Upgrade to https
            thumbnail = thumbnail.replace('http://', 'https://');
            // Remove edge curl effect
            thumbnail = thumbnail.replace(/&?edge=curl/, '');

            // Use the 'fife' parameter for higher quality images
            // This is more reliable than zoom/img parameters
            // Request up to 800px width - API returns the largest available up to this size
            if (!thumbnail.includes('fife=')) {
              thumbnail += '&fife=w800';
            }
          }
        }
        let authors = item.volumeInfo.authors;
        let authorNames = authors ? authors.join(", ") : "Unknown Author";

        // Only show books that have cover images
        if (thumbnail) {
          return (
            <Card
              key={item.id}
              className="book-card"
              onClick={() => handleCardClick(item)}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                backgroundColor: 'var(--lightteal)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 'none',
                },
              }}
            >
              <CardMedia
                component="img"
                image={thumbnail}
                alt={item.volumeInfo.title}
                onLoad={(e) => {
                  // Image loaded successfully, make it visible
                  e.target.style.opacity = '1';
                }}
                onError={((fallbackUrl) => (e) => {
                  const img = e.target;
                  const currentSrc = img.src;

                  // Prevent infinite loop - track attempts
                  if (!img.dataset.attemptCount) {
                    img.dataset.attemptCount = '0';
                  }

                  const attemptCount = parseInt(img.dataset.attemptCount);
                  console.log(`Image error (attempt ${attemptCount}):`, currentSrc);

                  if (attemptCount === 0 && currentSrc.includes('fife=w800')) {
                    // First fallback: try smaller size w400
                    const newSrc = currentSrc.replace('fife=w800', 'fife=w400');
                    console.log(`Trying fallback 1 (w400):`, newSrc);
                    img.src = newSrc;
                    img.dataset.attemptCount = '1';
                  } else if (attemptCount === 1 && currentSrc.includes('fife=')) {
                    // Second fallback: remove fife parameter entirely (use original)
                    const newSrc = currentSrc.replace(/&fife=w\d+/, '');
                    console.log(`Trying fallback 2 (no fife):`, newSrc);
                    img.src = newSrc;
                    img.dataset.attemptCount = '2';
                  } else if (attemptCount === 2 && fallbackUrl && currentSrc !== fallbackUrl) {
                    // Third fallback: try the original smallThumbnail URL as last resort
                    console.log(`Trying fallback 3 (smallThumbnail):`, fallbackUrl);
                    img.src = fallbackUrl;
                    img.dataset.attemptCount = '3';
                  } else {
                    // All attempts failed, hide the card immediately
                    console.log('All fallbacks failed, hiding card');
                    const card = img.closest('.book-card');
                    if (card) {
                      card.style.display = 'none';
                    }
                  }
                })(smallThumbnailUrl)}
                sx={{
                  aspectRatio: '2/3',
                  objectFit: 'cover',
                  width: '100%',
                  flexShrink: 0,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                }}
              />
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  padding: '12px',
                  '&:last-child': {
                    paddingBottom: '12px',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  className="book-title"
                  sx={{
                    fontFamily: 'Readex Pro, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    marginBottom: '0.4rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.3,
                    height: '2.6em',
                    color: 'white',
                  }}
                >
                  {item.volumeInfo.title}
                </Typography>
                <Typography
                  variant="body2"
                  className="book-author"
                  sx={{
                    fontFamily: 'Readex Pro, sans-serif',
                    fontSize: '0.75rem',
                    color: 'white',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  By {authorNames}
                </Typography>
                {/* Show rating stars for books in "Read" category */}
                {item.rating > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '8px', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <img
                        key={star}
                        src={star <= item.rating ? yellowStarIcon : greyStarIcon}
                        alt="Star"
                        style={{
                          width: '16px',
                          height: '16px',
                        }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        }
        return null;
      })}
      <BookPopup
        open={popupOpen}
        book={selectedBook}
        onClose={handleClosePopup}
        isOwnProfile={isOwnProfile}
      />
    </>
  );
};

export default BookCard;
