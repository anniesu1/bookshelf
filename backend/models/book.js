// Import frameworks
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema for users. Note that landlord information is not required. The idea
 * is that user can register without the landlord information and then should they
 * want to communicate with landlord later, they will be required to enter their
 * information then.
 */

const BookSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  stars: {
    type: String,
    required: true
  },
  reflections: {
    type: String,
  },

});

module.exports = BookSchema;
