require('dotenv').config({path: __dirname + '/../.env'});

const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// source.env stuff
const connect = process.env.MONGODB_URI;
const secret = process.env.SESSION_SECRET;
const emailPassword = process.env.EMAIL_PASSWORD;
const emailRoute = process.env.HOST_EMAIL_ROUTE;
const awsAccessKeyID = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsRegion = process.env.AWS_REGION;
let error = "";
if (!connect) {
  error = "MONGODB_URI";
} else if (!secret) {
  error = "SESSION_SECRET";
} else if (!emailPassword) {
  error = "EMAIL_PASSWORD";
} else if (!emailRoute) {
  error = "HOST_EMAIL_ROUTE";
} else if (!awsAccessKeyID) {
  error = "AWS_ACCESS_KEY_ID";
} else if (!awsSecretAccessKey) {
  error = "AWS_SECRET_ACCESS_KEY";
} else if (!awsRegion) {
  error = "AWS_REGION";
}
if (error) {
  console.error("ERROR: missing " + error + " environment variable");
  process.exit();
}

// Import backend routes
const account = require('./backend/routes/account');
const book = require('./backend/routes/book');

// Set up mongo
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
mongoose.connect(connect);

// Load in middleware
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret,
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  resave: true,
  saveUninitialized: true,
}));

// Prefix all backend routes with "/api"
app.use('/api/user', account);
app.use('/api/book', book);

// These are frontend routes
app.get('*', (request, response) => {
  response.sendFile(__dirname + '/public/index.html');
});

// Listen on the proper port for the application
app.listen(PORT, err => {
  err
    ? console.error(err)
    : console.info(`Listening on port ${PORT}. Visit http://localhost:${PORT}/ in your browser.`);
});
