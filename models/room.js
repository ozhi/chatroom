'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');

var roomSchema = new Schema({
    name       : {
        type     : String,
        required : true,
        unique   : true },
    password     : String,
    maxMembers   : Number,
    curMembers   : Number, //will maybe be removed
});

roomSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

roomSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};


var Room = mongoose.model('Room', roomSchema);

module.exports = Room;
