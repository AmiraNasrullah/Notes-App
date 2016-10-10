// Importing Node Packages
var express = require('express');
var passport = require('passport');

// Require Controllers
var UserController = require('./app/controllers/users_controller');
var AuthenticationController = require('./app/controllers/authentication_controller');
var NotesController = require('./app/controllers/notes_controller');

// Require Passport service
var passportService = require('./config/passport');

// Middleware to require login/auth
var requireLogin = passport.authenticate('local', { session: false });
var requireAuth = passport.authenticate('jwt', { session: false });

module.exports = function(app) {

  // Initializing api routes
  var apiRoutes = express.Router();
  var userRoutes = express.Router();
  var authRoutes = express.Router();
  var noteRoutes = express.Router();

  // Test Routes
  apiRoutes.post('/', requireAuth,function(req, res) {
    res.send({ content: 'API Home Page'});
	});

	// Create User route
  userRoutes.post('/', UserController.create);

  // Update User route
	userRoutes.put('/:id', UserController.update);

	// Delete user route
	userRoutes.delete('/:id', UserController.destroy);

  // Set user routes as subgroup/middleware to apiRoutes
  apiRoutes.use('/users', userRoutes);

  // Login route
  authRoutes.post('/login', requireLogin, AuthenticationController.login);

  // Set auth routes as subgroup/middleware to apiRoutes
  apiRoutes.use('/auth', authRoutes);

  // create note route
  noteRoutes.post('/', requireAuth, NotesController.create);

  // update note route
  noteRoutes.put('/:id', requireAuth, NotesController.update);
  
  // delete note route
  noteRoutes.delete('/:id', requireAuth, NotesController.delete);

  // share note route
  noteRoutes.post('/:id/share', requireAuth, NotesController.share);

  // Unshare note route
  noteRoutes.post('/:id/unshare', requireAuth, NotesController.unShare);

  // Set note routes as subgroup/middleware to apiRoutes
  apiRoutes.use('/notes', noteRoutes);

  // Setting endpoint for apiRoutes
  app.use('/api', apiRoutes);

}