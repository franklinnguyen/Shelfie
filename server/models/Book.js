const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    googleBooksId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    authors: [String],
    thumbnail: String,
    publishedDate: String,
    description: String,
    pageCount: Number,
    categories: [String],
    // User's book data
    category: {
      type: String,
      enum: ['To Be Read', 'Currently Reading', 'Read'],
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    review: {
      type: String,
      default: '',
    },
    likes: {
      type: [String], // Array of user googleIds who liked the post
      default: [],
    },
    comments: [
      {
        userId: {
          type: String,
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        replies: [
          {
            userId: {
              type: String,
              required: true,
            },
            username: {
              type: String,
              required: true,
            },
            text: {
              type: String,
              required: true,
            },
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Compound index to prevent duplicate books per user
bookSchema.index({ userId: 1, googleBooksId: 1 }, { unique: true });

module.exports = mongoose.model('Book', bookSchema);
