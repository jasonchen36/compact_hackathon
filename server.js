/*
 * CodeKast
 * =========
 * Read these:
 * https://github.com/jsbin/jsbin/wiki/Best-practices-for-building-your-own-live-paste-bin
 * http://www.programwitherik.com/socket-io-tutorial-with-node-js-and-express/
 */
var express      = require('express');
var path         = require('path');
var app          = express();
var port         = process.env.PORT || 3000;
var server       = require('http').createServer(app);
var io           = require('socket.io')(server);
var mongoose     = require('mongoose');
var passport     = require('passport');
var flash        = require('connect-flash');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

// configure database
var config = require('./config/settings');
mongoose.connect(config.database_url);

// configure passport utilities
require('./config/passport')(passport);

// configure view engine for express
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// configure express application
app.use(bodyParser.json()); // support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support URL-encoded bodies
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// configure sessions and initialize passport
app.use(session({ secret: config.secret_key, saveUninitialized: true, resave: true }));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // flash messages stored in session

// configure normal routes and socket-io handler
// Security concern: socketio do not support authentication for now
require('./app/routes')(app, passport);
require('./app/socketio')(io);

server.listen(port);
console.log('[CodeKast] Listening on port ' + port);