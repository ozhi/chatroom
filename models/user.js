var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    loggedIn : {
        type    : String,
        default : '' //could be ''(not logged in), 'facebook' or 'local'
    },
    color    : String,

    id    : String,
    token : String,
    email : String,
    name  : String, //these are for fb auth

    nickname : String,
});

var User = mongoose.model('User', userSchema);

module.exports = User;
