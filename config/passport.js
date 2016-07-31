var LocalStrategy = require('passport-local').Strategy;
var User          = require('../app/models/user');

module.exports = function(passport) {

  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // signup handler for local
  // todo: change so that email field is in the root json, rather than in local object
  passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) {
    // find a user whose email is the same as the email in the form
    // we are checking to see if the user trying to login already exists
    User.findOne({ 'local.email': email }, function(err, user) {
      // check to see if there's any error
      if (err) {
        return done(err);
      }

      // check to see if email exists
      if (user) {
        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
      }

      User.findOne({ 'username': req.body.username }, function(err, user_) {
        // check to see if there's any error
        if (err) {
          return done(err);
        }

        // check to see if username exists
        if (user_) {
          return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
        }

        // user not found, let's create the user
        var newUser = new User();

        // set the user's local credentials
        newUser.username = req.body.username;
        newUser.local.email = email;
        newUser.local.password = password;

        // save the user
        newUser.save(function(err) {
          if (err) {
            if (err.errors && err.name === "ValidationError") {
              for (var key in err.errors) {
                req.flash('signupMessage', err.errors[key].message);
              }
              return done(null, false);
            }
            throw err;
          }
          return done(null, newUser);
        });
      });
    });
  }));

  // login handler for local
  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'username_email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done) { // callback with email and password from our form
    // find a user whose email is the same as the forms email / username
    // we are checking to see if the user trying to login already exists
    if (email.indexOf('@') > -1) { // email
      User.findOne({ 'local.email':  email }, function(err, user) {
        // if there are any errors, return the error before anything else
        if (err) {
          return done(err);
        }

        // if no user is found, return the message
        if (!user) {
          return done(null, false, req.flash('loginMessage', 'No user found.'));
        }

        // if the user is found but the password is wrong
        if (!user.validPassword(password)) {
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
        }

        // all is well, return successful user
        return done(null, user);
      });
    } else { // username
      User.findOne({ 'username':  email }, function(err, user) {
        // if there are any errors, return the error before anything else
        if (err) {
          return done(err);
        }

        // if no user is found, return the message
        if (!user) {
          return done(null, false, req.flash('loginMessage', 'No user found.'));
        }

        // if the user is found but the password is wrong
        if (!user.validPassword(password)) {
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
        }

        // all is well, return successful user
        return done(null, user);
      });
    }
  }));
};