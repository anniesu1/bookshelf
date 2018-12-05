// Import frameworks
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema for users. Note that landlord information is not required. The idea
 * is that user can register without the landlord information and then should they
 * want to communicate with landlord later, they will be required to enter their
 * information then.
 */

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  authenticated: {
    type: Boolean,
    default: false,
  },
});

// TODO: Write a method that updates user schema when the user inputs their landlord information
UserSchema.method('authenticate', function() {
  this.authenticated = true;
});

module.exports = UserSchema;
