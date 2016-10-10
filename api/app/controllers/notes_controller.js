// Import Note model
var Note = require('../models/note');

// Import Mongoose Package
var mongoose = require('mongoose');

// Import Messages
var messages = require('../../config/response_messages');

// Error messages
var errorMessages = messages.errors.note;

// success messages
var successMessages = messages.success.note;

 /**
 * @api {post} /api/notes Create a new Note
 * @apiHeaderExample {json} Headers:
 *     {
 *       "Content-Type": "application/json",
 *       "Authorization": 'JWT token'
 *     }
 * @apiVersion 0.0.1
 * @apiName create
 * @apiGroup Note
 * @apiPermission user
 *
 * @apiDescription Create Note
 *
 * @apiParam {String} text Note text Required.
 * @apiParam {Json} image parameters {content, content type, filename} Required.

 * @apiSuccess {Number} note_id         The new Note-ID.
 * @apiSuccess {String} success         Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "note_id": "73618292",
 *       "success": "Note created successfully"
 *     }
 *
 * @apiError UnAuthorized invalid authorization token.
 *
 * @apiErrorExample UnAuthorized Error-Response: 
 *     HTTP/1.1 403 Forbidden
 *     UnAuthorized
 *
 * @apiError Text text was not found.
 *
 * @apiErrorExample NotFound Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "error": "You must enter a text"
 *     }
 */
exports.create = function(req, res, next) {

  // Load request parameters
  var text = req.body.text;
  var image = req.body.image;

  // Load user id from req
  var currentUser = req.user;
  var user_id = currentUser._id;

  // Return error if no text provided
  if (!text) {
    return res.status(422).send({ error: errorMessages.requiredText });
  }

  const note = new Note({
  	text: text,
    image: image,
    users: [user_id]
  });

  // save user
  note.save(function(err) {
    if (err) { return next(err); }
  	
  	// add note to notes ids in user
  	addNoteToUser(currentUser, note._id, function(err, result){
    	if (err) { return next(err); }
    	// Respond with success message
    	res.json({ note_id: note.id, success: successMessages.create });
  	});

  });
}

 /**
 * @api {put} /api/notes/:id Update Note
 * @apiHeaderExample {json} Headers:
 *     {
 *       "Content-Type": "application/json",
 *       "Authorization": 'JWT token'
 *     }
 * @apiVersion 0.0.1
 * @apiName update
 * @apiGroup Note
 * @apiPermission user
 *
 * @apiDescription Update Note
 *
 * @apiParam {String} id Note id. 
 * @apiParam {String} text Note text Optional.
 * @apiParam {Json} image parameters {content, content type, filename} Optional.

 * @apiSuccess {String} success         Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": "Note updated successfully"
 *     }
 *
 * @apiError UnAuthorized invalid authorization token.
 *
 * @apiErrorExample UnAuthorized Error-Response: 
 *     HTTP/1.1 403 Forbidden
 *     UnAuthorized
 *
 * @apiError Note Note not found.
 *
 * @apiErrorExample Note Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "error": "Note not found"
 *     }
 *
 * @apiError NoAccessRight Access Not found.
 *
 * @apiErrorExample Note Access-Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "error": "You don\'t have access to this note"
 *     } 
 */
exports.update = function(req, res, next) {

  // Load request parameters
  var noteParams = req.body;
  var noteId = req.params.id;

  // Load user from req
  var currentUser = req.user;

  // Find note with id in db
  findNote(noteId, currentUser._id, res, next, function(err, note) {
    if (err) { return next(err); }

    // update note
    note.update(noteParams, { upsert: true }, function(err, result) {
	  	if (err) { return next(err); }

	    // Respond with note message
	    res.json({success: successMessages.update });
	  });

  });
}

 /**
 * @api {delete} /api/notes/:id Delete Note
 * @apiHeaderExample {json} Headers:
 *     {
 *       "Content-Type": "application/json",
 *       "Authorization": 'JWT token'
 *     }
 * @apiVersion 0.0.1
 * @apiName delete
 * @apiGroup Note
 * @apiPermission user
 *
 * @apiDescription Delete Note
 *
 * @apiParam {String} id Note ID. 
 *
 * @apiSuccess {String} success         Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": "Note deleted successfully"
 *     }
 *
 * @apiError UnAuthorized invalid authorization token.
 *
 * @apiErrorExample UnAuthorized Error-Response: 
 *     HTTP/1.1 403 Forbidden
 *     UnAuthorized
 *
 * @apiError Note Note not found.
 *
 * @apiErrorExample Note Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "error": "Note not found"
 *     }
 *
 * @apiError NoAccessRight Access Not found.
 *
 * @apiErrorExample Note Access-Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "error": "You don\'t have access to this note"
 *     } 
 */
exports.delete = function(req, res, next) {

  // Load request parameters
  var noteId = req.params.id;

  // Load user from req
  var currentUser = req.user;

  // Find note with id in db
  findNote(noteId, currentUser._id, res, next, function(err, note) {
    if (err) { return next(err); }

    // delete note
    note.remove( function(err, result) {
	  	if (err) { return next(err); }

	    // Respond with success message
	    res.json({ success: successMessages.delete });
	  });
  });
}

 /**
 * @api {post} /api/notes/:id/share Share note with user
 * @apiHeaderExample {json} Headers:
 *     {
 *       "Content-Type": "application/json",
 *       "Authorization": 'JWT token'
 *     }
 * @apiVersion 0.0.1
 * @apiName share
 * @apiGroup Note
 * @apiPermission user
 *
 * @apiDescription Share note with user so they can see it as their notes.
 *
 * @apiParam {String} id Note id. 
 * @apiParam {String} user_id User id to share note with.

 * @apiSuccess {String} success         Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": "Note shared successfully"
 *     }
 *
 * @apiError UnAuthorized invalid authorization token.
 *
 * @apiErrorExample UnAuthorized Error-Response: 
 *     HTTP/1.1 403 Forbidden
 *     UnAuthorized
 *
 * @apiError Note Note not found.
 *
 * @apiErrorExample Note Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "error": "Note not found"
 *     }
 *
 * @apiError NoAccessRight Access Not found.
 *
 * @apiErrorExample Note Access-Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "error": "You don\'t have access to this note"
 *     } 
 */
exports.share = function(req, res, next) {

  // Load request parameters
  var noteId = req.params.id;
  var userId = req.body.userID;

  // Load user from req
  var currentUser = req.user;
	
  // Find note with id in db
  findNote(noteId, currentUser._id, res, next, function(err, note) {
  	if (err) { return next(err); }

    // update note
    note.update({ $pushAll: { users: [userId] } }, { upsert: true }, function(err, result) {
	  	if (err) { return next(err); }

	  	// add note to notes ids in user
	  	addNoteToUser(currentUser, noteId, function(err, result){
	    	if (err) { return next(err); }
		    // Respond with success message
		    res.json({success: successMessages.share });
	  	});

	  });
  });
}

 /**
 * @api {post} /api/notes/:id/unshare UnShare note with user
 * @apiHeaderExample {json} Headers:
 *     {
 *       "Content-Type": "application/json",
 *       "Authorization": 'JWT token'
 *     }
 * @apiVersion 0.0.1
 * @apiName unshare
 * @apiGroup Note
 * @apiPermission user
 *
 * @apiDescription UnShare note with user.
 *
 * @apiParam {String} id Note id. 
 * @apiParam {String} user_id User id to remove him from note.

 * @apiSuccess {String} success         Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": "Note unshared successfully"
 *     }
 *
 * @apiError UnAuthorized invalid authorization token.
 *
 * @apiErrorExample UnAuthorized Error-Response: 
 *     HTTP/1.1 403 Forbidden
 *     UnAuthorized
 *
 * @apiError Note Note not found.
 *
 * @apiErrorExample Note Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "error": "Note not found"
 *     }
 *
 * @apiError NoAccessRight Access Not found.
 *
 * @apiErrorExample Note Access-Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "error": "You don\'t have access to this note"
 *     } 
 */
exports.unShare = function(req, res, next) {

  // Load request parameters
  var noteId = req.params.id;
  var userId = req.body.userID;

  // Load user from req
  var currentUser = req.user;
	
  // Find note with id in db
  findNote(noteId, currentUser._id, res, next, function(err, note) {
    if (err) { return next(err); }

    // update note
    note.update({$pullAll: { users: [userId] } }, { upsert: true }, function(err, result) {
	  	if (err) { return next(err); }

	  	// remove note from notes ids in user
	  	removeNoteFromUser(currentUser, noteId, function(err, result){
	    	if (err) { return next(err); }
		    // Respond with success message
		    res.json({ success: successMessages.unshare });
	  	});

	  });
  });
}

/**
 * Helper method to find note and validate ability to access note
 * * 
 */
function findNote(noteId, userId, res, next, callback){

  // check if id length is valid "must be a single String of 12 bytes or a string of 24 hex characters"
	if (noteId.length != 24) {
  	return res.status(422).send({ error: errorMessages.notFound });
  }

  // Find note with id in db
  Note.findOne({ _id: noteId}, function(err, note) {
    if (err) { return next(err); }

    // If note is not found
    if (note == null) {
      return res.status(422).send({ error: errorMessages.notFound });
    }

    // if note has not user id in users array 
    if (note.users.indexOf(userId) == -1){
      return res.status(403).send({ error: errorMessages.accessNotFound });
    }

    return callback(null, note);
   });
}

/**
 * Helper method to add note to user
 * * 
 */
function addNoteToUser(user, noteId, callback){
	user.update({ $pushAll: { notes: [noteId] } }, { upsert: true }, function(err, result) {
		if (err) { return callback(err, false); }
    return callback(null, true)
  });
}

/**
 * Helper method to remove note to users' notes
 * * 
 */
function removeNoteFromUser(user, noteId, callback){
	user.update({ $pullAll: { notes: [noteId] } }, { upsert: true }, function(err, result) {
		if (err) { return callback(err, false); }
    return callback(null, true)
  });
}
