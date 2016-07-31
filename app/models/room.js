var mongoose = require('mongoose');

// define the schema for our user model
var roomSchema = mongoose.Schema({
  username: String,
  name: String,
  desc: String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Room', roomSchema);