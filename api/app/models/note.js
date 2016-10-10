// Importing Node packages required for user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var fs = require('fs');
var path = require('path');
const IMAGE_PATH = path.resolve('./uploads/notes/');

// Note Schema
var NoteSchema = new Schema({
  text: {
    type: String,
    required: true    
  },
  image: {},
  users : [ 
    { 
      type : mongoose.Schema.ObjectId,
      ref : 'User'
    } 
  ]
});

// Execute before each note.save() call
NoteSchema.pre('save', function(callback) {
  var note = this;

  // return if image not modified
  if (!note.isModified('image')) return callback();

  // upload image if modified
  note.uploadImage(callback);
});

// compare password
NoteSchema.methods.uploadImage = function(callback) {
  var note = this;

  //read image data
  var imageData = note.image;

  // read image content
  var buffer = new Buffer(imageData.content, 'base64');

  // read content type
  var contentType = imageData.contentType.split('/')[1];

  // read image name
  var imageName = imageData.fileName;

  // set image path
  var uploadedImageName = note.id + "_" + imageName + "." + contentType;

  // upload image 
  fs.writeFileSync(IMAGE_PATH + uploadedImageName, buffer);

  // delete all image params
  note.image = undefined;

  // set url only
  note.image = {
    url: uploadedImageName
  }
  // return callback
  return callback();

}

// Create model note with NoteSchema
module.exports = mongoose.model('Note', NoteSchema);
