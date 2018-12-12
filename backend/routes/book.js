const User = require('../models/models').User;
const Book = require('../models/models').Book;
const express = require('express');
const router = express.Router();

// Import JWT
var jwt = require('jwt-simple');
var secret = 'cis197isthebest';

function authenticateToken(sessionJWT, firstName, email) {
  console.log("sessionJWT " + sessionJWT);
  var userId = jwt.decode(sessionJWT, secret);
  User.findById(userId, (err, res) => {
    console.log("isAuthenticated err: " + err);
    console.log("isAuthenticated res: " + res);
    if (!err) {
      if (res.firstName === firstName && res.email === email) {
        return userId;
      }
    } else {
      return null;
    }
  });
}

/**
 * Create a new book
 */
router.post('/create', (req, res) => {
  const reflections = req.body.reflections;
  const title = req.body.title;
  const author = req.body.author;
  const stars = req.body.stars;

  console.log(req.session.token);
  console.log("req.session.token=" + req.session.token);
  console.log("req.session.firstName=" + req.session.firstName);
  console.log("type of token: " + typeof(req.session.token));
  var userId = jwt.decode(req.session.token, secret);
  var firstName = req.session.firstName;
  var email = req.session.email;

  if (!reflections || !title || !author || !stars) {
    res.send({
      success: false,
      error: 'Error: Please fill out all form fields',
    });
    return;
  }

  User.findById(userId, (err, userRes) => {
    console.log("isAuthenticated err: " + err);
    console.log("isAuthenticated res: " + res);
    if (!err) {
      if (userRes.firstName === firstName && userRes.email === email) {
        Book.findOne({ 'title': title, 'author': author }, (existingBookErr, existingBook) => {
          if (existingBookErr) {
            res.send({
              success: false,
              error: 'Error connecting to database',
            });
            return;
          } else
          // Check if the book is already an existing book in the database
          if (existingBook) {
            res.send({
              success: false,
              error: "Book already exists",
            });
            return;
          } else {
            // Create a new book
            const newBook = new Book({
              title: title,
              author: author,
              stars: stars,
              reflections: reflections,
            });

            newBook.save(function (saveBookErr, newBookDoc) {
              if (saveBookErr) {
                res.send({
                  success: false,
                  error: 'Could not save book',
                });
              } else {
                // Push to user's book collection
                userRes.books.push(newBookDoc._id);
                userRes.save(function (saveUserErr) {
                  if (saveUserErr) {
                    res.send({
                      success: false,
                      error: saveUserErr
                    });
                  } else {
                    console.log("successfully bound the book to the user");
                    res.send({
                      success: true,
                      error: null
                    });
                  }
                });
              }
            });
          }
        });
      }
    } else {
      res.redirect("http://localhost:3000/");
    }
  });

  // Attempt to find book in database
  if (userId) {
    Book.findOne({ 'title': title, 'author': author }, (existingBookErr, existingBook) => {
      if (existingBookErr) {
      	res.send({
      		success: false,
      		error: 'Error connecting to database',
      	});
        return;
      } else
    	// Check if the book is already an existing book in the database
      if (existingBook) {
        res.send({
          success: false,
          error: "Book already exists",
        });
        return;
      } else {
        // Create a new book
        const newBook = new Book({
          title: title,
          author: author,
          stars: stars,
          reflections: reflections,
        });

        newBook.save(function (saveBookErr, newBookDoc) {
          if (saveBookErr) {
            res.send({
              success: false,
              error: 'Could not save book',
            });
          } else {
            // Push to user's book collection
            User.findById(userId, (findUserErr, findUserData) => {
              if (findUserErr) {
                res.send({
                  success: false,
                  error: 'Could not save book',
                });
              } else {
                findUserData.books.push(newBookDoc._id);
                findUserData.save(function (saveUserErr) {
                  if (saveUserErr) {
                    res.send({
                      success: false,
                      error: saveUserErr
                    })
                  } else {
                    console.log("successfully bound the book to the user");
                    res.send({
                      success: true,
                      error: null
                    })
                  }
                });
              }
            });

          }
        });
      }
    });
  } else {
    // TODO: update the url accordingly after deployment
    res.redirect("http://localhost:3000/");
  }
});



module.exports = router;
