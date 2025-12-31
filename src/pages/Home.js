// src/pages/Home.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, IconButton, TextField } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { useUser } from '../context/UserContext';
import BookPopup from '../components/BookPopup';
import './Home.css';
import defaultProfile from '../assets/icons/DefaultProfile.svg';
import yellowStarIcon from '../assets/icons/YellowStar.svg';
import greyStarIcon from '../assets/icons/GreyStar.svg';

function Home() {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeed = async () => {
      if (!user || !user.sub) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5001/api/books/feed/${user.sub}`);
        if (response.ok) {
          const data = await response.json();
          setFeedItems(data);
        }
      } catch (error) {
        console.error('Error fetching feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [user?.sub]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleUserClick = (username, event) => {
    event.stopPropagation();
    navigate(`/${username}`);
  };

  const handleBookClick = async (item) => {
    // Check if the current user already has this book in their library
    let userBook = null;
    if (user?.sub) {
      try {
        const response = await fetch(`http://localhost:5001/api/books/user/${user.sub}`);
        if (response.ok) {
          const userBooks = await response.json();
          userBook = userBooks.find(b => b.googleBooksId === item.googleBooksId);
        }
      } catch (error) {
        console.error('Error fetching user books:', error);
      }
    }

    // Transform the flat feed item structure to match Google Books API format
    // Use user's own book data if they have it, otherwise start fresh (not friend's data)
    const transformedBook = {
      _id: userBook?._id,
      id: item.googleBooksId,
      category: userBook?.category,
      rating: userBook?.rating || 0,
      review: userBook?.review || '',
      volumeInfo: {
        title: item.title,
        authors: item.authors,
        description: item.description,
        imageLinks: {
          thumbnail: item.thumbnail
        },
        publishedDate: item.publishedDate,
        pageCount: item.pageCount,
        categories: item.categories,
        previewLink: null
      }
    };
    setSelectedBook(transformedBook);
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setSelectedBook(null);
  };

  const handleLike = async (itemId, event) => {
    event.stopPropagation();
    if (!user?.sub) return;

    try {
      const response = await fetch(`http://localhost:5001/api/books/${itemId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.sub }),
      });

      if (response.ok) {
        const { likes } = await response.json();
        setFeedItems(prevItems =>
          prevItems.map(item =>
            item._id === itemId ? { ...item, likes } : item
          )
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentSubmit = async (itemId, event) => {
    event.stopPropagation();
    const commentText = commentInputs[itemId];
    if (!commentText?.trim() || !user?.sub) return;

    try {
      const response = await fetch(`http://localhost:5001/api/books/${itemId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.sub,
          username: user.username,
          text: commentText.trim(),
        }),
      });

      if (response.ok) {
        const { comments } = await response.json();
        setFeedItems(prevItems =>
          prevItems.map(item =>
            item._id === itemId ? { ...item, comments } : item
          )
        );
        setCommentInputs(prev => ({ ...prev, [itemId]: '' }));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (itemId, commentId, event) => {
    event.stopPropagation();

    try {
      const response = await fetch(`http://localhost:5001/api/books/${itemId}/comment/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const { comments } = await response.json();
        setFeedItems(prevItems =>
          prevItems.map(item =>
            item._id === itemId ? { ...item, comments } : item
          )
        );
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const toggleComments = (itemId, event) => {
    event.stopPropagation();
    setShowComments(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="feed-container">
          <p className="loading-text">Loading feed...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="home-page">
        <div className="feed-container">
          <p className="empty-feed-text">Please log in to view your feed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="feed-container">
        {feedItems.length === 0 ? (
          <div className="empty-feed">
            <p className="empty-feed-text">
              Your feed is empty. Follow other users to see their book updates!
            </p>
          </div>
        ) : (
          <div className="feed-items">
            {feedItems.map((item) => (
              <div
                key={item._id}
                className="feed-item"
                onClick={() => handleBookClick(item)}
              >
                <div className="feed-item-header">
                  <div
                    className="feed-user-info"
                    onClick={(e) => handleUserClick(item.user.username, e)}
                  >
                    <Avatar
                      src={item.user.profilePicture || defaultProfile}
                      alt={item.user.username}
                      sx={{
                        width: 40,
                        height: 40,
                        border: '2px solid var(--white)',
                        cursor: 'pointer',
                      }}
                    />
                    <span className="feed-username">@{item.user.username}</span>
                  </div>
                  <span className="feed-time">{formatDate(item.updatedAt)}</span>
                </div>

                <div className="feed-item-content">
                  <div className="feed-book-display">
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="feed-book-cover"
                      />
                    )}
                    <div className="feed-book-info">
                      <h3 className="feed-book-title">{item.title}</h3>
                      <p className="feed-book-author">
                        by {item.authors?.join(', ') || 'Unknown Author'}
                      </p>
                    </div>
                  </div>

                  <div className="feed-status">
                    <span className="status-badge">{item.category}</span>
                  </div>

                  {item.rating > 0 && (
                    <div className="feed-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <img
                          key={star}
                          src={star <= item.rating ? yellowStarIcon : greyStarIcon}
                          alt="Star"
                          className="rating-star"
                        />
                      ))}
                    </div>
                  )}

                  {item.review && (
                    <div className="feed-review">
                      <p className="review-text">{item.review}</p>
                    </div>
                  )}

                  {/* Like and Comment Actions */}
                  <div className="feed-actions">
                    <div className="feed-actions-buttons">
                      <IconButton
                        onClick={(e) => handleLike(item._id, e)}
                        sx={{ color: 'var(--white)', padding: '4px' }}
                      >
                        {item.likes?.includes(user?.sub) ? (
                          <FavoriteIcon sx={{ fontSize: '20px', color: 'var(--lightteal)' }} />
                        ) : (
                          <FavoriteBorderIcon sx={{ fontSize: '20px' }} />
                        )}
                      </IconButton>
                      <span className="action-count">{item.likes?.length || 0}</span>

                      <IconButton
                        onClick={(e) => toggleComments(item._id, e)}
                        sx={{ color: 'var(--white)', padding: '4px', marginLeft: '12px' }}
                      >
                        <ChatBubbleOutlineIcon sx={{ fontSize: '20px' }} />
                      </IconButton>
                      <span className="action-count">{item.comments?.length || 0}</span>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {showComments[item._id] && (
                    <div className="comments-section" onClick={(e) => e.stopPropagation()}>
                      {/* Comment Input */}
                      <div className="comment-input-container">
                        <TextField
                          size="small"
                          placeholder="Add a comment..."
                          value={commentInputs[item._id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [item._id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleCommentSubmit(item._id, e);
                            }
                          }}
                          sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                              fontFamily: 'Readex Pro, sans-serif',
                              color: 'var(--white)',
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                              },
                              '&:hover fieldset': {
                                borderColor: 'var(--white)',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'var(--lightteal)',
                              },
                            },
                            '& .MuiInputBase-input::placeholder': {
                              color: 'rgba(255, 255, 255, 0.6)',
                              opacity: 1,
                            },
                          }}
                        />
                        <IconButton
                          onClick={(e) => handleCommentSubmit(item._id, e)}
                          disabled={!commentInputs[item._id]?.trim()}
                          sx={{
                            color: 'var(--lightteal)',
                            '&.Mui-disabled': {
                              color: 'rgba(255, 255, 255, 0.3)',
                            },
                          }}
                        >
                          <SendIcon />
                        </IconButton>
                      </div>

                      {/* Comments List */}
                      {item.comments && item.comments.length > 0 && (
                        <div className="comments-list">
                          {item.comments.map((comment) => (
                            <div key={comment._id} className="comment-item">
                              <div className="comment-header">
                                <span className="comment-username">@{comment.username}</span>
                                <span className="comment-time">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="comment-text">{comment.text}</p>
                              {comment.userId === user?.sub && (
                                <IconButton
                                  onClick={(e) => handleDeleteComment(item._id, comment._id, e)}
                                  sx={{
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    padding: '4px',
                                    position: 'absolute',
                                    right: '8px',
                                    top: '8px',
                                    '&:hover': {
                                      color: 'var(--lightteal)',
                                    },
                                  }}
                                >
                                  <DeleteIcon sx={{ fontSize: '16px' }} />
                                </IconButton>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BookPopup
        open={popupOpen}
        book={selectedBook}
        onClose={handleClosePopup}
        isOwnProfile={true}
      />
    </div>
  );
}

export default Home;
