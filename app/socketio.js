var Room = require('../app/models/room');

module.exports = function(io) {

  var users = {};
  var nsp = io.of('/classroom');
  var room = {}; // room id as key, code as value

  // Connected to classroom namespace
  nsp.on('connection', function(socket) {
    console.log('Client connected...', socket.id);
    socket.emit('connected');

    socket.on('loadClass', function(class_id) { // equivalent to join class
      socket.join(class_id);
      console.log(socket.id, 'Joining room: ', class_id);

      //var user = { socketId : socket.id};
      //users[username] = user;
      //console.log("Users :",users);

      // Up to this part it is almost done.
      // 1. Next thing is to differentiate between students and instructor
      // 2. And how instructor get students screen.

      // Supposed to load from database and broadcast the html code to the viewer
      // instead of null

      if (room[class_id] != 'undefined') {
        socket.emit('loadedClass', room[class_id]);
      } else {
        socket.emit('loadedClass', null);
      }
    });

    socket.on('changeName', function(data) {
      // broadcast to everyone this name change except myself
      socket.broadcast.to(data.class_id).emit('name_changed', data.newName);

      // update the database
      Room.findOne({ '_id': data.class_id }, function(err, found) {
        if (err) {
          throw err;
        }
        if (found) {
          found.name = data.newName;
          found.save();
        } else {
          // do nothing
        }
      });
    });

    socket.on('content_changed', function(data) {
      // broadcast to everyone this name change except myself
      socket.broadcast.to(data.class_id).emit('content_changed', data.code);

      room[data.class_id] = data.code;
      // todo: update the database? or every 30 seconds?
    });

    // not too sure what this function is supposed to do
    socket.on('request',function(socketId) {
      //console.log("Receive a request to view: ",socketId);

      console.log('Users in the room:')
      var usersInRooms = io.nsps['/classroom'].adapter.rooms['abc001'];
      console.log(users)

      var userid = users[1]; //testing, always send to the second user.
      console.log("Requesting code from:",userid);

      //Send message to a room (excluding self)
      //socket.to('abc001').emit('event','everything');

      //Send message to a room (INCLUDING self)
      //io.nsps['/classroom'].to('abc001').emit('event', 'Everything');

      //var userSocket = io.sockets.connected[userid];
      //console.log(userSocket);

      io.nsps['/classroom'].to(userid).emit('event', 'Show me your code');
    });

  });
};