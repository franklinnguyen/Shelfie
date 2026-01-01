// Utility functions for managing guest mode data in localStorage

const GUEST_STORAGE_KEYS = {
  LIKES: 'shelfie_guest_likes',
  COMMENTS: 'shelfie_guest_comments',
  BOOKS: 'shelfie_guest_books',
};

// Clear all guest data from localStorage
export const clearGuestStorage = () => {
  Object.values(GUEST_STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// Likes management
export const getGuestLikes = () => {
  try {
    const likes = localStorage.getItem(GUEST_STORAGE_KEYS.LIKES);
    return likes ? JSON.parse(likes) : {};
  } catch (error) {
    console.error('Error reading guest likes:', error);
    return {};
  }
};

export const saveGuestLike = (postId, userId) => {
  const likes = getGuestLikes();
  if (!likes[postId]) {
    likes[postId] = [];
  }
  if (!likes[postId].includes(userId)) {
    likes[postId].push(userId);
  }
  localStorage.setItem(GUEST_STORAGE_KEYS.LIKES, JSON.stringify(likes));
};

export const removeGuestLike = (postId, userId) => {
  const likes = getGuestLikes();
  if (likes[postId]) {
    likes[postId] = likes[postId].filter(id => id !== userId);
  }
  localStorage.setItem(GUEST_STORAGE_KEYS.LIKES, JSON.stringify(likes));
};

// Comments management
export const getGuestComments = () => {
  try {
    const comments = localStorage.getItem(GUEST_STORAGE_KEYS.COMMENTS);
    return comments ? JSON.parse(comments) : {};
  } catch (error) {
    console.error('Error reading guest comments:', error);
    return {};
  }
};

export const saveGuestComment = (postId, comment) => {
  const comments = getGuestComments();
  if (!comments[postId]) {
    comments[postId] = [];
  }
  comments[postId].push(comment);
  localStorage.setItem(GUEST_STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
};

export const removeGuestComment = (postId, commentId) => {
  const comments = getGuestComments();
  if (comments[postId]) {
    comments[postId] = comments[postId].filter(c => c._id !== commentId);
  }
  localStorage.setItem(GUEST_STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
};

// Books management
export const getGuestBooks = () => {
  try {
    const books = localStorage.getItem(GUEST_STORAGE_KEYS.BOOKS);
    return books ? JSON.parse(books) : {};
  } catch (error) {
    console.error('Error reading guest books:', error);
    return {};
  }
};

export const saveGuestBook = (googleBooksId, bookData) => {
  const books = getGuestBooks();
  books[googleBooksId] = bookData;
  localStorage.setItem(GUEST_STORAGE_KEYS.BOOKS, JSON.stringify(books));
};

export const removeGuestBook = (googleBooksId) => {
  const books = getGuestBooks();
  delete books[googleBooksId];
  localStorage.setItem(GUEST_STORAGE_KEYS.BOOKS, JSON.stringify(books));
};

export const getGuestBook = (googleBooksId) => {
  const books = getGuestBooks();
  return books[googleBooksId] || null;
};
