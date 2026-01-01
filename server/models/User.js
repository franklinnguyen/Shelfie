const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
    },
    given_name: String,
    family_name: String,
    username: {
      type: String,
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: 'Welcome to Shelfie!',
    },
    profilePicture: {
      type: String,
      default: null,
    },
    hasCustomProfilePicture: {
      type: Boolean,
      default: false,
    },
    num_friends: {
      type: Number,
      default: 0,
    },
    num_following: {
      type: Number,
      default: 0,
    },
    following: {
      type: [String],
      default: [],
    },
    followers: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
