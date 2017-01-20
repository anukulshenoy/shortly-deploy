var db = require('../config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var userSchema = new Schema({
  username: String,
  password: String
});

var User = mongoose.model('User', userSchema);

module.exports = User;
