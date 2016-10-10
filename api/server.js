// Importing Node modules and initializing Express
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var router = require('./router');
var mongoose = require('mongoose');
var settings = require('./config/settings');

// Database Setup
mongoose.connect(settings.database_uri);

// Parses urlencoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 

// Send JSON responses
app.use(bodyParser.json()); 

// Log requests to API using morgan
app.use(logger('dev'));

// Import routes to be served
router(app);

// Start the server
app.listen(settings.port);
console.log('Your server is running on port ' + settings.port + '.');
