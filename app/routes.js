//var helpers = require('./helpers');
var Room    = require('../app/models/room');

module.exports = function(app, passport) {

  // home page
  app.get('/', function(req, res) {
    res.render('index.ejs'); // load the index.ejs file
  });

  app.get('/profile', function(req, res) {
    res.render('profile.ejs'); // load the index.ejs file
  });
  // login form
  app.get('/login', notLoggedIn, function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });
  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/classrooms', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));
  // signup form
  app.get('/signup', notLoggedIn, function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });
  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/classrooms', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', {
      user : req.user // get the user out of session and pass to template
    });
  });
  // call this route to destroy session
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
  app.get('/about', function(req, res) {
    res.render('about.ejs');
  });
  app.get('/project', function(req, res) {
    res.render('project.ejs');
  });
  // show all classrooms belonging to logged in user
  app.get('/classrooms', isLoggedIn, function(req, res) {
    var room = [];
    Room.find({ 'username': req.user.username }, function(err, found_rooms) {
      if (found_rooms) {
        room = found_rooms;
      }
      res.render('classrooms.ejs', {
        user : req.user, // get the user out of session and pass to template
        rooms : room
      });
    });
  });
  // creating a new class
  app.post('/classrooms', isLoggedInJson, function(req, res) {
    var newRoom = new Room();
    newRoom.username = req.user.username;
    newRoom.name = req.body.name;
    newRoom.desc = req.body.desc;
    newRoom.save(function(err) {
      if (err) {
        throw err;
      }
      res.json(newRoom);
    });
  });
  // This is when a user join a classroom by entering the classroom id directly (with a link)
  // e.g http://localhost:3000/classroom/fs66ix5c
  app.get('/classrooms/:room_id', function(req, res) {
    Room.findOne({ '_id': req.params.room_id }, function(err, found) {
      if (err) {
        // should flash a message stating room not found
        res.redirect('/classrooms');
        return;
      }
      if (found) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated()) { // room owner
          res.render(req.user.username === found.username ? 'room_caster.ejs' : 'room_viewer.ejs', {
            user : req.user,
            room : found
          });
        } else { // definitely viewer
          // todo, implement live view and replay view
          // replay will be record and play
          res.render('room_viewer.ejs', {
            room : found
          });
        }
      } else {
        // should flash a message stating room not found
        res.redirect('/classrooms');
      }
    });
  });
  // api that lists all classrooms, (public and private not implemented yet)
  // it will show all for now
  app.get('/api/classrooms', function(req, res) {
    Room.find({}, function(err, found_rooms) {
      if (err) {
        res.status(500);
        res.json({ 'error' : 'Error loading classrooms' });
      } else {
        res.json(found_rooms);
      }
    });
  });

};
// route middleware to check if user is logged in, JSON
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
    return next();
  }

  // if they aren't redirect them to the home page
  req.flash('loginMessage', 'Please login to proceed.');
  res.redirect('/login');
}
// route middleware to check if user is logged in, JSON
function isLoggedInJson(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(403); // forbidden, or should it be 401?
  res.json({ 'error': 'You are not logged in yet.' });
}
// route middleware to check if user is NOT logged in
function notLoggedIn(req, res, next) {
  // if user is not authenticated, then carry on
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/profile');
}
