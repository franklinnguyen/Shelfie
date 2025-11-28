import { Card, CardMedia, CardContent, Typography } from "@mui/material";
import "./BookCard.css";

const BookCard = ({ books }) => {
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

            // Increase image size by modifying zoom and img parameters
            // zoom=1 is default (128px width), zoom=0 is larger
            if (thumbnail.includes('zoom=1')) {
              thumbnail = thumbnail.replace('zoom=1', 'zoom=0');
            }

            // img=1 is small, img=0 can be larger
            if (thumbnail.includes('img=1')) {
              thumbnail = thumbnail.replace('img=1', 'img=0');
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
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <CardMedia
                component="img"
                image={thumbnail}
                alt={item.volumeInfo.title}
                onError={((fallbackUrl) => (e) => {
                  const img = e.target;
                  const currentSrc = img.src;

                  // Prevent infinite loop - track attempts
                  if (!img.dataset.attemptCount) {
                    img.dataset.attemptCount = '0';
                  }

                  const attemptCount = parseInt(img.dataset.attemptCount);

                  if (attemptCount === 0 && currentSrc.includes('zoom=0')) {
                    // First fallback: try zoom=1
                    img.src = currentSrc.replace('zoom=0', 'zoom=1');
                    img.dataset.attemptCount = '1';
                  } else if (attemptCount === 1 && currentSrc.includes('zoom=')) {
                    // Second fallback: remove zoom parameter entirely
                    img.src = currentSrc.replace(/[?&]zoom=\d+/, '');
                    img.dataset.attemptCount = '2';
                  } else if (attemptCount === 2 && currentSrc.includes('img=0')) {
                    // Third fallback: try img=1
                    img.src = currentSrc.replace('img=0', 'img=1');
                    img.dataset.attemptCount = '3';
                  } else if (attemptCount === 3 && fallbackUrl && currentSrc !== fallbackUrl) {
                    // Fourth fallback: try the original smallThumbnail URL as last resort
                    img.src = fallbackUrl;
                    img.dataset.attemptCount = '4';
                  } else {
                    // All attempts failed, hide the card
                    img.closest('.book-card').style.display = 'none';
                  }
                })(smallThumbnailUrl)}
                sx={{
                  aspectRatio: '2/3',
                  objectFit: 'cover',
                  width: '100%',
                  flexShrink: 0,
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
                    color: 'text.secondary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  By {authorNames}
                </Typography>
              </CardContent>
            </Card>
          );
        }
        return null;
      })}
    </>
  );
};

export default BookCard;
