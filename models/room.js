var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomSchema = new Schema({
    name       : {
        type     : String,
        required : true,
        unique   : true },
    password     : String,
    maxMembers   : Number,
    curMembers   : Number, //will maybe be removed
    lastActivity : {
        type    : Date,
        expires : 60,
        default : Date.now
    } 
});

var Room = mongoose.model('Room', roomSchema);

module.exports = Room;
