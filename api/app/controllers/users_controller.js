// Import User model
var User = require('../models/user');

// Import Mongoose Package
var mongoose = require('mongoose');

// Import Messages
var messages = require('../../config/response_messages');

// Error messages
var errorMessages = messages.errors.user;

// success messages
var successMessages = messages.success.user;

// mongoose objectId max length 24 HEX
const OBJECT_ID_MAX_LENGTH = 24;

 /**
 * @api {post} /api/users Create a new User
 * @apiVersion 0.0.1
 * @apiName create
 * @apiGroup User
 * @apiPermission none
 *
 * @apiDescription Create User
 *
 * @apiParam {String} username Username of user account  Required.
 * @apiParam {String} password Password of user account   Required.
 * @apiParam {String} email Email Address Optional.
 * @apiParam {String} fullname User full Name   Optional.

 * @apiSuccess {Number} user_id         The new User-ID.
 * @apiSuccess {String} success         Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user_id": "73618292",
 *       "success": "User created successfully"
 *     }
 *
 * @apiError UserName username was not found.
 *
 * @apiErrorExample Username not found Error-Response :
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "error": "You must enter a username"
 *     }
 * @apiError Password password was not found.
 *
 * @apiErrorExample Password not found Error-Response :
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "error": "You must enter a password"
 *     }
 */
exports.create = function(req, res, next) {

  // Load request parameters
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
  var fullname = req.body.fullname;

  // Return error if no username provided
  if (!username) {
    return res.status(422).send({ error: errorMessages.requiredName });
  }

  // Return error if no password provided
  if (!password) {
    return res.status(422).send({ error: errorMessages.requiredPassword });
  }

  // find user with same username(in lowercase) in db
  User.findOne({ username: username.toLowerCase() }, function(err, existingUser) {
    if (err) { return next(err); }

    // If user is not unique, return error
    if (existingUser) {
      return res.status(422).send({ error: errorMessages.usernameTaken });
    }

    // If username is unique and password was provided, create account
    const user = new User({
    	username: username,
      password: password,
      email: email,
      fullname: fullname
    });

    // save user
    user.save(function(err) {
      if (err) { return next(err); }

      // Respond with user id and success message
      res.json({user_id: user.id, success: successMessages.create});
    });
  });
}


 /**
 * @api {put} /api/users/:id Update user
 * @apiVersion 0.0.1
 * @apiName update
 * @apiGroup User
 * @apiPermission none
 *
 * @apiDescription Update user
 *
 * @apiParam {String} id expected user id                 Required.
 * @apiParam {String} username Username of user account   Optional.
 * @apiParam {String} password Password of user account   Optional.
 * @apiParam {String} email Email Address                 Optional.
 * @apiParam {String} fullname User Full Name             Optional.
 *
 * @apiSuccess {String} success success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": "User updated successfully"
 *     }
 *
 * @apiError UserNotFound user was not found.
 *
 * @apiErrorExample User Not Found Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "error": "User not found."
 *     }
 */ 
exports.update = function(req, res, next) {

	// Load user id from params
  var id = req.params.id;

  // check if id length is valid "must be a single String of 12 bytes 
  // or a string of 24 hex characters"
	if (id.length != OBJECT_ID_MAX_LENGTH) {
  	return res.status(422).send({ error: errorMessages.notFound });
  }

  // Load user params from body
  var userParams = req.body;

  // Find user with id in db
  User.findOne({ _id: id}, function(err, user) {
    if (err) { return next(err); }

    // If user is not found
    if (user == null) {
      return res.status(422).send({ error: errorMessages.notFound });
    }
    // update user
    user.update(userParams, {safe:true}, function(err, result) {
	  	if (err) { return next(err); }

	    // Respond with user and success message
	    res.json({ success: successMessages.update });
	  });

  });
}

 /**
 * @api {delete} /api/users/:id Delete user
 * @apiVersion 0.0.1
 * @apiName delete
 * @apiGroup User
 * @apiPermission none
 *
 * @apiDescription Delete user
 *
 * @apiParam {String} id User ID          Required.
 *
 * @apiSuccess {String} success success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": "User updated successfully"
 *     }
 *
 * @apiError User user was not found.
 *
 * @apiErrorExample User Not Found Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "error": "User not found."
 *     }
 */ 
exports.destroy = function(req, res, next) {

	// Load user id from params
  var id = req.params.id;

  // check if id length is valid "must be a single String of 12 bytes 
  // or a string of 24 hex characters"
	if (id.length != OBJECT_ID_MAX_LENGTH) {
  	return res.status(422).send({ error: errorMessages.notFound });
  }

  // Find user with id in db
  User.findOne({ _id: id}, function(err, user) {
    if (err) { return next(err); }

    // If user is not found
    if (user == null) {
      return res.status(422).send({ error: errorMessages.notFound });
    }

    // delete user
    user.remove( function(err, result) {
	  	if (err) { return next(err); }

	    // Respond with user and success message
	    res.json({ success: successMessages.delete });
	  });

  });
}
