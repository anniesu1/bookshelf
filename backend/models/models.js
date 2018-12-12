// Import frameworks
const mongoose = require('mongoose');

// Import schema files
const UserSchema = require('./user');
const BookSchema = require('./book');

// Create models on database side
const User = mongoose.model('User', UserSchema);
const Book = mongoose.model('Book', BookSchema);

// Export all schemas
module.exports = {
  User,
  Book,
};
