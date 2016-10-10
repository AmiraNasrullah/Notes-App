// Importing Node packages required for user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Bcrypt-nodejs package to encrypt/decrypt password
var bcrypt = require('bcrypt-nodejs');

// User Schema
var UserSchema = new Schema({
  username: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },  
  password: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  fullname: {
    type: String
  },
  notes : [ 
    { 
      type : mongoose.Schema.ObjectId,
      ref : 'Note'
    } 
  ]  
});

//----Inject functions to UserSchema-----

// Execute before each user.save() call
UserSchema.pre('save', function(callback) {
  var user = this;

  // return if the password hasn't changed
  if (!user.isModified('password')) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {

      // return error
      if (err) return callback(err);

      // set hashed password
      user.password = hash;

      // call callback
      callback();
    });
  });
});

// compare password
UserSchema.methods.comparePassword = function(userPassword, cb) {
  bcrypt.compare(userPassword, this.password, function(err, isMatch) {
    if (err) { return cb(err); }

    cb(null, isMatch);
  });
}

// Create model user with UserSchema
module.exports = mongoose.model('User', UserSchema);
