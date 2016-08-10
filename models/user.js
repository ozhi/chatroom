var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    id    : { type : String, required : true },
    token : String,
    email : String,
    name  : String
});

var User = mongoose.model('User', userSchema);

module.exports = User;
