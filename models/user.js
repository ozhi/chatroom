var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    id    : String,
    token : String,
    email : String,
    name  : String, //these are for fb auth

    nickname : String,
    color    : String
});

var User = mongoose.model('User', userSchema);

module.exports = User;
