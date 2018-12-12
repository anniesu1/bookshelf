const User = require('../models/models').User;
const Book = require('../models/models').Book;
const express = require('express');
const router = express.Router();

// Import JWT
var jwt = require('jwt-simple');
var secret = 'cis197isthebest';

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
            res.setHeader('success', false);
            res.setHeader('error', 'Error connecting to database');
          } else
          // Check if the book is already an existing book in the database
          if (existingBook) {
            res.setHeader('success', false);
            res.setHeader('error', 'Error connecting to database');
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

                res.setHeader('success', false);
                res.setHeader('error', 'Error connecting to database');
              } else {
                // Push to user's book collection
                userRes.books.push(newBookDoc._id);
                userRes.save(function (saveUserErr) {
                  if (saveUserErr) {

                    res.setHeader('success', false);
                    res.setHeader('error', 'Error connecting to database');
                  } else {
                    console.log("successfully bound the book to the user");
                    res.setHeader('success', true);
                    res.setHeader('error', null);
                  }
                });
              }
            });
            res.end();
          }
        });
      }
    } else {
      res.send({
        success: false,
        error: 'Cannot authenticate user'
      })
    }
  });
});

router.get('/getBooks', (req, res) => {
  var userId = jwt.decode(req.session.token, secret);
  var firstName = req.session.firstName;
  var email = req.session.email;

  User.findById(userId)
      .populate('books')
      .exec((populateErr, user) => {
        if (populateErr) {
          res.send({
            data: null,
            error: populateErr
          })
          return;
        } else {
          res.json({
            data: user.books,
            error: null
          });
          return;
        }
      })
});

module.exports = router;
