var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomSchema = new Schema({
    name       : {
        type     : String,
        required : true,
        unique   : true },
    password   : String,
    maxMembers : Number
});

var Room = mongoose.model('Room', roomSchema);

module.exports = Room;
