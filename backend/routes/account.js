// Import frameworks
const bCrypt = require('bcrypt-nodejs');
const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
        req.session.email = email;
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
 * Helper function to send an email when the user registers
 */
const sendEmailAuth = (emailRecipient, userId, cb) => {
  // Error checking
  if (!emailRecipient || emailRecipient === '') {
    // Trigger the callback function
    cb({
      success: false,
      error: 'You must provide an email',
    });
    return;
  }

  const pendingVerif = new PendingVerification({
    user: userId,
  });
  pendingVerif.save()
    .catch(saveVerifErr => {
      cb({
        success: false,
        error: 'Error saving verification for user: ' + saveVerifErr.message,
      });
    });

  // Create the email object with a link to authenticate the user
  const msg = {
    from: process.env.SENDGRID_EMAIL,
    to: emailRecipient,
    subject: 'Your CLS verification email',
    html: `<p>
            Hi NAME,<br/><br/>
            Please click on the link below to verify your account:<br/>
            ${pendingVerif.getConfirmationLink()}<br/>
            Thanks</p>`,
  };

  // Send the email
  sgMail.send(msg, (err, result) => {
    if (err) {
      cb({
        success: false,
        error: 'Validation email could not be sent: ' + err.toString(),
      });
    } else {
      cb({
        success: true,
        error: null,
      });
    }
  });
};

/**
 * Handle authenticating and resending confirmation emails
 */
router.post('/authenticate', (req, res) => {
  // Obtain the confirmation token
  const token = req.body.token;

  // Try to find this token in the database
  PendingVerification.findOne({ 'hash': token })
    .populate('user')
    .exec((verificationErr, dbVerification) => {
    if (verificationErr || !dbVerification) {
      res.send({
        success: false,
        error: 'Error finding verification token: ' + verificationErr,
      });
      return;
    } else if (dbVerification.isExpired()) {
      // The token exists, but it has expired
      res.send({
        success: false,
        error: 'Verification token expired. Please resend authentication email',
      });
      return;
    } else {
      // Authenticate the user with this token
        let user = dbVerification.user;
        user.authenticate();
        user.save()
          .then(newUser => {
            // Once we authenticate user, delete verification token
            // TOOD: change to id
            PendingVerification.deleteOne({ 'user' : dbVerification.user }, (err, verifObj) => {
              if (err) {
                //TODO? still send success but with error message
                res.send({
                  success: false,
                  error: 'Could not delete verification token',
                })
              }
            })
            res.send({
              success: true,
              error: null,
            });
          })
          .catch(saveUserErr => {
            res.send({
              success: false,
              error: 'Error saving authentication: ' + saveUserErr,
            });
          });
      //});
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
 * Handle resending of verification email
 */
router.post('/resend', (req, res) => {
  // Check if user is logged in
  if (!req.session.email) {
    res.send({
      success: false,
      error: 'You must be logged in.'
    });
    return;
  }

  // Find the current user
  User.findOne({'email': req.session.email}, (errUser, user) => {
    if (errUser || !user) {
      res.send({
        success: false,
        error: 'Error finding user.'
      });
      return;
    }

    // Delete current verification token; it's expired and/or will be replaced
    PendingVerification.findOneAndDelete({'user': user.id}, (err, verifToken) => {
      if (err) {
        res.send({
          success: false,
          error: 'Error deleting current auth token'
        });
        return;
      }
    })

    // Resend an email to confirm their account
    sendEmailAuth(user.email, user.id, emailRes => {
      res.send({
        success: emailRes.success,
        error: emailRes.error,
      });
      return;
    });
  });
});

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
        sendEmailAuth(newUser.email, newUser.id, emailRes => {
          res.send({
            success: emailRes.success,
            error: emailRes.error,
          });
        });
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
 * Register a user
 */
router.post('/register', (req, res) => {
  // Pull values from the request
  const {
    type,
    firstName,
    lastName,
    email,
    password,
    startDate
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
  if (!type || !firstName || !lastName || !password || !startDate) {
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
    } else
  	// If the email already exists, send an error
    if (existingUser) {
		  res.send({
			  success: false,
		    error: 'User with email ' + req.body.email + ' already exists.',
		  });
      return;
    } else {
      // If there is not already a user in the database with the same email
      // Create a new user in the database
      const user = new User({
        type,
        firstName,
        lastName,
        email,
        password: createHash(req.body.password),
        startDate
      });

      // Attempt to save the user
      user.save()
        .then(newUser => {
          // Send the verification email
          sendEmailAuth(newUser.email, emailRes => {
            res.send({
              success: emailRes.success,
              info: emailRes.email,
              user: newUser,
              error: emailRes.error,
            });
          });
        })
        .catch(saveUserErr => {
          // If there was an error
          res.send({
            success: false,
            error: 'Error saving user, ' + saveUserErr.message,
          });
        });
    }
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

/**
* Change password
*/
router.post('/changePassword', (req, res) => {
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
    oldPassword,
    newPassword,
    newPasswordVerify
  } = req.body;

  // Trim inputs
  oldPassword = oldPassword.trim();
  newPassword = newPassword.trim();
  newPasswordVerify = newPasswordVerify.trim();

  // Check if any inputs are empty
  if (!oldPassword || !newPassword || !newPasswordVerify) {
    res.send({
      success: false,
      error: 'Error: Please fill out all password form fields'
    });
    return;
  }

  // Check that both new password and new password verification are the same
  if (newPassword !== newPasswordVerify) {
    res.send({
      success: false,
      error: 'Error: new passwords do not match'
    });
    return;
  }

  User.findOne({ 'email': email }, (err, user) => {
    // Check that the old password matches the user's old password input
    if (bCrypt.compareSync(oldPassword, user.password)) {
      // Change the password of the user
      user.password = createHash(newPassword);

      // Save the user information updates to database
      user.save(function (saveUserErr) {
        if (saveUserErr) {
          res.send({
            success: false,
            error: 'Could not update and save user password',
          });
        } else {
          res.send({
            success: true,
            error: null,
          });
        }
      });
    }
  });
});


module.exports = router;