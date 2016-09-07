'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var roomSchema = new Schema({
    name       : {
        type     : String,
        required : true,
        unique   : true },
    password     : String,
    maxMembers   : Number,
    curMembers   : Number, //will maybe be removed
    members      : {
        type    : Object,
        default : {}
    }
});

function sha256(data) {
    return crypto.createHash("sha256").update(data).digest("base64");
}

roomSchema.methods.generateHash = function(password) {
    return sha256(password);
};

roomSchema.methods.validPassword = function(password) {
    return sha256(password) === this.password;
};


var Room = mongoose.model('Room', roomSchema);

module.exports = Room;
