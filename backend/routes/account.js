// Import frameworks
const bCrypt = require('bcrypt-nodejs');
const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Import JWT
var jwt = require('jwt-simple');
var secret = 'cis197isthebest';

// Import models
const User = require('../models/models').User;
const PendingVerification = require('../models/models').PendingVerification;

/**
 * Log in an existing user
 */
router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Check if user is null
  if (!email) {
    res.send({
      success: false,
      error: 'Error: Please provide a email',
    });
    return;
  }

  // Attempt to find user in database
  User.findOne({ 'email': email }, (existingUserErr, existingUser) => {
    if (existingUserErr) {
    	res.send({
    		success: false,
    		error: 'Error connecting to database',
    	});
      return;
    } else
  	// Check that the email matches a user in the backend
    if (existingUser) {
      // Check that the hashed input password equals the backend password
      if (bCrypt.compareSync(password, existingUser.password)) {
        // Set JWT token and update session information
        var payload = existingUser._id;
        var token = jwt.encode(payload, secret);
        req.session.token = token;
        req.session.firstName = existingUser.firstName;
        req.session.email = existingUser.email;
        console.log("req.session is " + req.session);

        // Log in the user
        res.send({
      		success: true,
      		error: null,
      	});
        return;
      } else {
        // Password mismatch -- user with this email and password does not exist
        res.send({
      		success: false,
      		error: 'User with this email and password does not exist',
      	});
        return;
      }
    } else {
      res.send({
			  success: false,
		    error: 'User with this email and password does not exist.',
		  });
      return;
    }
  });
});

/**
 * Generates hash using bCrypt, storing password safely
 */
const createHash = (password) => {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10));
};

/**
 * Verify that the input matches email regex
 */
function emailIsValid(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Register a user
 */
router.post('/register', (req, res) => {
  // Pull values from the request
  const {
    firstName,
    lastName,
    email,
    password,
  } = req.body;

  // Check that the input email is a valid email url

  if (!emailIsValid(email)) {
    res.send({
      success: false,
      error: 'Invalid email',
    });
    return;
  }

  // Check if any of the form fields are null
  if (!firstName || !lastName || !email || !password ) {
    res.send({
      success: false,
      error: 'Please complete all form fields',
    });
    return;
  }

  // Check to see if the email is already in the database
  User.findOne({ 'email': email }, (existingUserErr, existingUser) => {
    if (existingUserErr) {
    	res.send({
    		success: false,
    		error: 'Error connecting to database',
    	});
      return;
    } else if (existingUser) {
  	  // If the email already exists, send an error
		  res.send({
			  success: false,
		    error: 'User with email ' + req.body.email + ' already exists.',
		  });
      return;
    }

    // If there is not already a user in the database with the same email
    // Create a new user in the database
    const user = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: createHash(req.body.password),
    });

    // Attempt to save the user
    user.save()
      .then(newUser => {
        // Send the verification email
        res.send({
          success: true,
          error: null
        })
      })
      .catch(saveUserErr => {
        // If there was an error
        res.send({
          success: false,
          error: 'Error saving user: ' + saveUserErr.message,
        });
      });
  });
});

/**
 * Delete a user if logged in
 */
router.post('/delete', (req, res) => {
  const email = req.session.email;

  // Check if email is null
  if (!email) {
    res.send({
      success: false,
      error: 'Error: no user is logged in',
    });
    return;
  }

  // Delete the user from MongoDB
  try {
    User.findOneAndDelete({'email': email}, (err, deletedUser) => {
      // If there was an error in deletion
      if (err) {
        res.send({
          success: false,
          error: 'Error deleting account: ' + err,
        });
        return;
      }
    });
  } catch (e) {
    res.send({
      success: false,
      error: 'Error deleting account: ' + e.message,
    });
    return;
  }

  // Destroy the current session
  req.session.destroy(err => {
    // If there is an error destroying the session
    if (err) {
      res.send({
        success: false,
        error: 'Error destroying session: ' + err.message,
      });
      return;
    }

    // Return that logging out was a success
    res.send({
      success: true,
      error: null,
    });
    return;
  });
});

/**
* Get a user's profile information
*/
router.get('/getUserInfo', (req, res) => {
  const email = req.session.email;
  User.findOne({ 'email': email }, (err, user) => {
    if (err) {
      res.send({
        success: false,
        error: 'Error: could not retrieve user information',
      });
      return;
    } else {
      res.send(JSON.stringify({user}));
      return;
    }
  });
});

/**
* Update a user's information
*/
router.post('/update', (req, res) => {
  // Check if user is logged in
  const email = req.session.email;
  if (!email) {
    res.send({
      success: false,
      error: 'Error: no user is logged in',
    });
    return;
  }

  // Pull values from the request
  var {
    type,
    firstName,
    lastName,
  } = req.body;

  // Find user in the database
  User.findOne({ 'email': email }, (err, user) => {
    if (err) {
      res.send({
        success: false,
        error: 'Error connecting to database',
      });
      return;
    } else if (user) {
      // If the user exists, update user information accordingly

      // Trim inputs
      type = type.trim();
      firstName = firstName.trim();
      lastName = lastName.trim();

      // Check if any of the form fields are null
      if (!type || !firstName || !lastName) {
        res.send({
          success: false,
          error: 'Please complete all form fields',
        });
        return;
      }

      // Update user information
      user.type = type;
      user.firstName = firstName;
      user.lastName = lastName;

      // Save the user information updates to database
      user.save((saveUserErr) => {
        if (saveUserErr) {
          res.send({
            success: false,
            error: 'Could not update and save user information',
          });
          return;
        } else {
          res.send({
            success: true,
            error: null,
          });
          return;
        }
      });
    }
  });
});

module.exports = router;
