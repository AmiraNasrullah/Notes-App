// Importing Passport, strategies, and settings
var passport = require('passport');
var User = require('../app/models/user');
var LocalStrategy = require('passport-local');
var settings = require('./settings');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

// Setting up local login strategy
const localLogin = new LocalStrategy({}, function(username, password, done) {

	// Find user by username
  User.findOne({ username: username.toLowerCase() }, function(err, user) {
    if(err) { return done(err); }
    if(!user) { return done(null, false, { error: 'No user exists with that username' }); }

    // compare passwords
    user.comparePassword(password, function(err, isMatch) {
      if (err) { return done(err); }
      if (!isMatch) { return done(null, false, { error: "Invalid password" }); }

      return done(null, user);
    });
  });
});

// register local login to passport
passport.use(localLogin);


// Setting JWT strategy options
var jwtOptions = {
  //  check authorization headers for JWT
  jwtFromRequest: ExtractJwt.fromAuthHeader(),
  // Telling Passport key secret
  secretOrKey: settings.secret
};

// Setting up JWT login strategy
var jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  User.findOne({ id: payload.id }, function(err, user) {
    if (err) { return done(err, false); }

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

// register jwt login to passport
passport.use(jwtLogin);

