// Import external frameworks
require('dotenv').config({path: __dirname + '/../.env'});

const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Pull data from the environment variables
const connect = process.env.MONGODB_URI;
const secret = process.env.SESSION_SECRET;
const emailPassword = process.env.EMAIL_PASSWORD;
const emailRoute = process.env.HOST_EMAIL_ROUTE;
const awsAccessKeyID = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const awsRegion = process.env.AWS_REGION;

// Ensure data is present
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
  // Exit the server if some environment variables were not present
  process.exit();
}

// Import backend routes
const account = require('./backend/routes/account');
const imageUpload = require('./backend/routes/imageUpload');
const book = require('./backend/routes/book');

// Storage of information
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// Connecting to mongo
mongoose.connect(connect);

// Middleware
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
app.use('/api/', imageUpload);
app.use('/api/book', book);

// All other routes go to the frontend
app.get('*', (request, response) => {
  response.sendFile(__dirname + '/public/index.html'); // For React/Redux
});

// Listen on the proper port for the application
app.listen(PORT, err => {
  err
    ? console.error(err)
    : console.info(`Listening on port ${PORT}. Visit http://localhost:${PORT}/ in your browser.`);
});
