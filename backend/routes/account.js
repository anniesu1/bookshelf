// Import frameworks
const bCrypt = require('bcrypt-nodejs');
const express = require('express');
const router = express.Router();

// Import JWT
var jwt = require('jwt-simple');
var secret = 'cis197isthebest';

// Import models
const User = require('../models/models').User;

router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

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
    if (existingUser) {
      // Check that password input was correct
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
        // Passwords did not match
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

const createHash = (password) => {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10));
};

function emailIsValid(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

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

    const user = new User({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: createHash(req.body.password),
    });

    user.save()
      .then(newUser => {
        res.send({
          success: true,
          error: null
        })
      })
      .catch(saveUserErr => {
        res.send({
          success: false,
          error: 'Error saving user: ' + saveUserErr.message,
        });
      });
  });
});

router.post('/delete', (req, res) => {
  const email = req.session.email;
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

router.get('/getUserInfo', (req, res) => {
  const userId = jwt.decode(req.session.token);
  const firstName = req.session.firstName;
  const email = req.session.email;

  User.findById(userId, (err, userRes) => {
    console.log("isAuthenticated err: " + err);
    console.log("isAuthenticated res: " + res);
    if (!err) {
      if (userRes.firstName === firstName && userRes.email === email) {
        res.send(JSON.stringify({user}));
      }
    } else {
      res.send({
        success: false,
        error: "Error: could not retrieve user information"
      })
    }
  });
});

router.post('/update', (req, res) => {
  // TODO: update this to include JWT verification
  const email = req.session.email;
  if (!email) {
    res.send({
      success: false,
      error: 'Error: no user is logged in',
    });
    return;
  }
  var {
    type,
    firstName,
    lastName,
  } = req.body;

  User.findOne({ 'email': email }, (err, user) => {
    if (err) {
      res.send({
        success: false,
        error: 'Error connecting to database',
      });
      return;
    } else if (user) {

      type = type.trim();
      firstName = firstName.trim();
      lastName = lastName.trim();

      if (!type || !firstName || !lastName) {
        res.send({
          success: false,
          error: 'Please complete all form fields',
        });
        return;
      }

      user.type = type;
      user.firstName = firstName;
      user.lastName = lastName;

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
