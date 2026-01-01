// src/pages/Home.js
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, IconButton, TextField, Button } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import { useUser } from '../context/UserContext';
import BookPopup from '../components/BookPopup';
import { getGuestLikes, saveGuestLike, removeGuestLike, getGuestComments, saveGuestComment, removeGuestComment, getGuestBooks } from '../utils/guestStorage';
import { API_URL } from '../config';
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
  const [replyInputs, setReplyInputs] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const bookRefs = useRef({});

  // Update page title
  useEffect(() => {
    document.title = 'Shelfie';
  }, []);

  useEffect(() => {
    const fetchFeed = async () => {
      if (!user || !user.sub) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/books/feed/${user.sub}`);
        if (response.ok) {
          const data = await response.json();

          // For guest mode, merge with localStorage data
          if (user.isGuest) {
            const guestLikes = getGuestLikes();
            const guestComments = getGuestComments();
            const guestBooks = getGuestBooks();

            // Transform guest books into feed items
            const guestFeedItems = Object.values(guestBooks).map(book => ({
              _id: `guest_book_${book.googleBooksId}`,
              googleBooksId: book.googleBooksId,
              title: book.title,
              authors: book.authors,
              thumbnail: book.thumbnail,
              publishedDate: book.publishedDate,
              description: book.description,
              pageCount: book.pageCount,
              categories: book.categories,
              category: book.categoryDisplay,
              rating: book.rating || 0,
              review: book.review || '',
              userId: user.sub,
              user: {
                username: user.username,
                profilePicture: user.profilePicture || null,
              },
              likes: [],
              comments: [],
              updatedAt: new Date().toISOString(),
            }));

            // Merge guest books with feed from backend
            const mergedData = [...data, ...guestFeedItems].map(item => {
              const itemLikes = guestLikes[item._id] || [];
              const itemComments = guestComments[item._id] || [];

              return {
                ...item,
                likes: [...(item.likes || []), ...itemLikes],
                comments: [...(item.comments || []), ...itemComments],
              };
            });

            // Sort by most recent
            mergedData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

            setFeedItems(mergedData);
          } else {
            setFeedItems(data);
          }
        }
      } catch (error) {
        console.error('Error fetching feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [user?.sub, user?.isGuest, user?.username, user?.profilePicture, refreshTrigger]);

  // Scroll to book when navigating from notification
  useEffect(() => {
    if (location.state?.scrollToBookId && feedItems.length > 0) {
      const bookId = location.state.scrollToBookId;
      const bookElement = bookRefs.current[bookId];

      if (bookElement) {
        setTimeout(() => {
          bookElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight the post briefly
          bookElement.style.transition = 'background-color 0.3s ease';
          bookElement.style.backgroundColor = 'rgba(91, 10, 120, 0.1)';
          setTimeout(() => {
            bookElement.style.backgroundColor = '';
          }, 2000);
        }, 100);
      }

      // Clear the state immediately to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.scrollToBookId]);

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
    if (user?.sub && !user?.isGuest) {
      try {
        const response = await fetch(`${API_URL}/api/books/user/${user.sub}`);
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
    // Trigger a refresh for guest users to update the feed with any changes
    if (user?.isGuest) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleLike = async (itemId, event) => {
    event.stopPropagation();
    if (!user?.sub) return;

    // For guest mode, save to localStorage
    if (user?.isGuest) {
      setFeedItems(prevItems =>
        prevItems.map(item => {
          if (item._id === itemId) {
            const likes = item.likes || [];
            const likeIndex = likes.indexOf(user.sub);
            const newLikes = likeIndex === -1
              ? [...likes, user.sub]
              : likes.filter(id => id !== user.sub);

            // Save to localStorage
            if (likeIndex === -1) {
              saveGuestLike(itemId, user.sub);
            } else {
              removeGuestLike(itemId, user.sub);
            }

            return { ...item, likes: newLikes };
          }
          return item;
        })
      );
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/books/${itemId}/like`, {
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

    // For guest mode, save to localStorage
    if (user?.isGuest) {
      const newComment = {
        _id: 'guest_comment_' + Date.now(),
        userId: user.sub,
        username: user.username,
        text: commentText.trim(),
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      saveGuestComment(itemId, newComment);

      setFeedItems(prevItems =>
        prevItems.map(item => {
          if (item._id === itemId) {
            const comments = item.comments || [];
            return { ...item, comments: [...comments, newComment] };
          }
          return item;
        })
      );
      setCommentInputs(prev => ({ ...prev, [itemId]: '' }));
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/books/${itemId}/comment`, {
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

    // For guest mode, remove from localStorage
    if (user?.isGuest) {
      // Remove from localStorage
      removeGuestComment(itemId, commentId);

      setFeedItems(prevItems =>
        prevItems.map(item => {
          if (item._id === itemId) {
            const comments = item.comments?.filter(c => c._id !== commentId) || [];
            return { ...item, comments };
          }
          return item;
        })
      );
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/books/${itemId}/comment/${commentId}`, {
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

  const toggleReplyInput = (commentId, event) => {
    event.stopPropagation();
    setShowReplyInput(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handleReplySubmit = async (itemId, commentId, event) => {
    event.stopPropagation();
    const replyText = replyInputs[commentId];
    if (!replyText?.trim() || !user?.sub) return;

    try {
      const response = await fetch(`${API_URL}/api/books/${itemId}/comment/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.sub,
          username: user.username,
          text: replyText.trim(),
        }),
      });

      if (response.ok) {
        const { comments } = await response.json();
        setFeedItems(prevItems =>
          prevItems.map(item =>
            item._id === itemId ? { ...item, comments } : item
          )
        );
        setReplyInputs(prev => ({ ...prev, [commentId]: '' }));
        setShowReplyInput(prev => ({ ...prev, [commentId]: false }));
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleCommentLike = async (itemId, commentId, event) => {
    event.stopPropagation();
    if (!user?.sub || user?.isGuest) return;

    try {
      const response = await fetch(`${API_URL}/api/books/${itemId}/comment/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.sub,
          username: user.username,
        }),
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
      console.error('Error liking comment:', error);
    }
  };

  const handleReplyLike = async (itemId, commentId, replyId, event) => {
    event.stopPropagation();
    if (!user?.sub || user?.isGuest) return;

    try {
      const response = await fetch(`${API_URL}/api/books/${itemId}/comment/${commentId}/reply/${replyId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.sub,
          username: user.username,
        }),
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
      console.error('Error liking reply:', error);
    }
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
                ref={(el) => (bookRefs.current[item._id] = el)}
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
                    <span className="feed-username">
                      {item.user.username === user?.username ? 'you' : `@${item.user.username}`}
                    </span>
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

                              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                                {!user?.isGuest && (
                                  <IconButton
                                    onClick={(e) => handleCommentLike(item._id, comment._id, e)}
                                    sx={{
                                      color: comment.likes?.includes(user?.sub) ? 'var(--lightteal)' : 'rgba(255, 255, 255, 0.6)',
                                      padding: '4px',
                                      '&:hover': {
                                        color: 'var(--lightteal)',
                                      },
                                    }}
                                  >
                                    {comment.likes?.includes(user?.sub) ? (
                                      <FavoriteIcon sx={{ fontSize: '16px' }} />
                                    ) : (
                                      <FavoriteBorderIcon sx={{ fontSize: '16px' }} />
                                    )}
                                  </IconButton>
                                )}
                                {comment.likes && comment.likes.length > 0 && (
                                  <span style={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '0.75rem',
                                    marginRight: '8px'
                                  }}>
                                    {comment.likes.length}
                                  </span>
                                )}
                                <Button
                                  startIcon={<ReplyIcon sx={{ fontSize: '14px' }} />}
                                  onClick={(e) => toggleReplyInput(comment._id, e)}
                                  sx={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '0.75rem',
                                    textTransform: 'none',
                                    padding: '2px 8px',
                                    minWidth: 'auto',
                                    '&:hover': {
                                      color: 'var(--lightteal)',
                                      backgroundColor: 'rgba(0, 128, 128, 0.1)',
                                    },
                                  }}
                                >
                                  Reply
                                </Button>
                                {comment.userId === user?.sub && (
                                  <IconButton
                                    onClick={(e) => handleDeleteComment(item._id, comment._id, e)}
                                    sx={{
                                      color: 'rgba(255, 255, 255, 0.6)',
                                      padding: '4px',
                                      '&:hover': {
                                        color: 'var(--lightteal)',
                                      },
                                    }}
                                  >
                                    <DeleteIcon sx={{ fontSize: '16px' }} />
                                  </IconButton>
                                )}
                              </div>

                              {/* Reply Input */}
                              {showReplyInput[comment._id] && (
                                <div style={{ marginTop: '12px', marginLeft: '20px' }}>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <TextField
                                      size="small"
                                      placeholder="Write a reply..."
                                      value={replyInputs[comment._id] || ''}
                                      onChange={(e) => setReplyInputs(prev => ({ ...prev, [comment._id]: e.target.value }))}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          handleReplySubmit(item._id, comment._id, e);
                                        }
                                      }}
                                      sx={{
                                        flex: 1,
                                        '& .MuiOutlinedInput-root': {
                                          fontFamily: 'Readex Pro, sans-serif',
                                          fontSize: '0.875rem',
                                          color: 'var(--white)',
                                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                          '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                          },
                                          '&:hover fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.4)',
                                          },
                                          '&.Mui-focused fieldset': {
                                            borderColor: 'var(--lightteal)',
                                          },
                                        },
                                      }}
                                    />
                                    <IconButton
                                      onClick={(e) => handleReplySubmit(item._id, comment._id, e)}
                                      disabled={!replyInputs[comment._id]?.trim()}
                                      sx={{
                                        color: 'var(--lightteal)',
                                        '&.Mui-disabled': {
                                          color: 'rgba(255, 255, 255, 0.3)',
                                        },
                                      }}
                                    >
                                      <SendIcon sx={{ fontSize: '18px' }} />
                                    </IconButton>
                                  </div>
                                </div>
                              )}

                              {/* Replies List */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div style={{ marginLeft: '20px', marginTop: '12px' }}>
                                  {comment.replies.map((reply) => (
                                    <div key={reply._id} style={{
                                      padding: '8px',
                                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                      borderRadius: '8px',
                                      marginBottom: '8px',
                                      borderLeft: '2px solid var(--lightteal)'
                                    }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{
                                          color: 'var(--lightteal)',
                                          fontSize: '0.85rem',
                                          fontWeight: 600
                                        }}>
                                          @{reply.username}
                                        </span>
                                        <span style={{
                                          color: 'rgba(255, 255, 255, 0.5)',
                                          fontSize: '0.7rem'
                                        }}>
                                          {formatDate(reply.createdAt)}
                                        </span>
                                      </div>
                                      <p style={{
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontSize: '0.875rem',
                                        margin: 0,
                                        marginBottom: '8px'
                                      }}>
                                        {reply.text}
                                      </p>
                                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {!user?.isGuest && (
                                          <IconButton
                                            onClick={(e) => handleReplyLike(item._id, comment._id, reply._id, e)}
                                            sx={{
                                              color: reply.likes?.includes(user?.sub) ? 'var(--lightteal)' : 'rgba(255, 255, 255, 0.6)',
                                              padding: '4px',
                                              '&:hover': {
                                                color: 'var(--lightteal)',
                                              },
                                            }}
                                          >
                                            {reply.likes?.includes(user?.sub) ? (
                                              <FavoriteIcon sx={{ fontSize: '14px' }} />
                                            ) : (
                                              <FavoriteBorderIcon sx={{ fontSize: '14px' }} />
                                            )}
                                          </IconButton>
                                        )}
                                        {reply.likes && reply.likes.length > 0 && (
                                          <span style={{
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            fontSize: '0.7rem'
                                          }}>
                                            {reply.likes.length}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
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
