var mongoose  = require('mongoose');
var bcrypt    = require('bcrypt-nodejs');
var validator = require('validator');

// define the schema for our user model
var userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  // if we are planning to add more strategies like facebook/google/github
  // we will need to remove required: true for the two below
  local: {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  created_at: { type: Date, default: Date.now }
});

// built-in instance methods (http://mongoosejs.com/docs/guide.html#methods)

// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

// before save hook
userSchema.pre('save', function(next) {
  if (!this.isModified('local.password')) {
    return next();
  }
  this.local.password = this.generateHash(this.local.password);
  next();
});

var userModel = mongoose.model('User', userSchema);

// validations
userModel.schema.path('username').validate(function(username) {
  return validator.isLength(username, 6);
}, 'Username must be at least 6 characters');

userModel.schema.path('local.email').validate(function(email) {
  return validator.isEmail(email);
}, 'Invalid email');

userModel.schema.path('local.password').validate(function(password) {
  return validator.isLength(password, 6);
}, 'Password must be at least 6 characters');

// create the model for users and expose it to our app
module.exports = userModel;
