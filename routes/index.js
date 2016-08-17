'use strict';

var User = require('../models/user.js');
var Room = require('../models/room.js');
var randomColor = require('./util.js').randomColor;

module.exports = function(app, passport, io) {

    app.use('', function(req, res, next) { //this middleware may not be a very good solution
        if(req.user)
            req.session.user = req.user;
        next();
    });

    app.get(['/', '/rooms'], function(req, res) {
        if(!req.session.user)
            return res.render('login.ejs');

        Room.find({}, function(err, roomsList) {
            if(err)
                return handleError(err);

            res.render('rooms.ejs', {
                roomsList : roomsList,
                user : req.session.user
            }); 
        });
    });

    app.get('/isFree/:nickname', function(req, res) {
        var nickname = req.params.nickname;
        
        if(!(/^[a-z_][a-z0-9_]*$/gi).test(nickname))
            return res.json({msg : 'no special characters'});
        
        User.findOne({nickname : nickname}, function(err, user) {
            if(err)
                return handleError(err);
            
            res.json({
                msg : (user ? 'taken' : 'free')
            });
        });
    });

    app.post('/', function(req, res) {
        var nickname = req.body.nickname;
        var color    = randomColor();

        User.findOne({nickname : nickname}, function(err, user) {
            if(err)
                return handleError(err);
            
            if(user)
                return res.json({nicknameIsFree : 'taken'});

            var newUser = new User({
                nickname : nickname,
                color    : color,
                loggedIn : 'local'
            });

            newUser.save(function(err) {
                if(err)
                    return console.log(err);
                
                req.session.user = newUser;

                res.json({nicknameIsFree : 'free'});
            });
        });
    });

    app.get('/f', function(req, res) {
        Room.find({}).remove(function() {});
        res.redirect('/');
    });

    app.get('/logout', ensureLoggedIn, logout);
    
    app.get('/auth/facebook', passport.authenticate('facebook'));

    app.get('/auth/facebook/callback', passport.authenticate('facebook'), function(req, res) {
        res.redirect('/');
    });


    app.post('/rooms', ensureLoggedIn, function(req, res) { //create a new room
        Room.find({name : req.body.newRoomNameField}, function(err, result) {
            if(err)
                return HandleError(err);
            
            if(result.length)
                return res.redirect('/rooms');

            var newRoom = new Room();
            newRoom.name         = req.body.newRoomNameField;

            if(req.body.newRoomPasswordField)
                newRoom.password = newRoom.generateHash(req.body.newRoomPasswordField); //or else leave it undefined

            newRoom.maxMembers   = req.body.newRoomMaxMembersField;
            newRoom.curMembers   = 0;
           
            newRoom.save(function(err) {
                if(err)
                    console.log(err);
                
                io.emit('room created', newRoom);
                                
                res.redirect('/rooms/' + req.body.newRoomNameField);
             });
        });
    });

    app.get('/rooms/:roomName', ensureLoggedIn, function(req, res) {
        var roomName = req.params.roomName;
        Room.findOne({name : roomName}, function(err, room) {
            if(err)
                return handleError(err);
            
            if(!room)
                return res.redirect('/rooms');

            if(room.curMembers + 1 > room.maxMembers)
                return res.send('Room is full.');
                        
            if(!room.password) //undefined or empty string
                res.render('room.ejs', {
                    user        : req.session.user,
                    room        : room
                });
            else
                res.render('roomPass.ejs', {
                    user : req.session.user,
                    room : room
                });
        });
    });
    
    app.post('/rooms/:roomName', ensureLoggedIn, function(req, res) {
        var roomName = req.params.roomName;
        var password = req.body.joinRoomPasswordField;

        if(!(/^[a-z0-9_]*$/gi).test(roomName))
            return res.json({msg : 'no special characters'});

        Room.findOne({name : roomName}, function(err, room) {
            if(err)
                return handleError(err);
            
            if(!room) {
                res.redirect('/rooms');
                return;
            }

            if(room.curMembers+1 > room.maxMembers)
                return res.send('Room is full.');
            
            if(!room.validPassword(password))
                res.redirect('/rooms/' + roomName);
            
            else
                res.render('room.ejs', {
                    user        : req.session.user,
                    room        : room
                });
        });
    });


    
    io.on('connection', function(socket) {
        var nickname = socket.client.request.session.user.nickname;
        var color    = socket.client.request.session.user.color;
        
        socket.on('room join', function(roomNameParam) {
            var roomName = socket.client.request.session.roomName = roomNameParam;

            joinRoom(socket, roomName, nickname, color, io);
            
            socket.on('chat message', function(msg) {
                io.to(roomName).emit('chat message', {
                    msg      : msg,
                    nickname : nickname,
                    color    : color
                });
            });

            socket.on('room leave', function() {
                leaveRoom(socket, nickname, color, io); //idempotent
            });
        });

        socket.on('disconnect', function() {
            leaveRoom(socket, nickname, color, io);
            deleteUser(socket.client.request.session.user.nickname, function() {});
        });
    });
};

function ensureLoggedIn(req, res, next) {
    if (req.session.user)
        return next();       
    else
        res.redirect('/');
}

function deleteUser(nickname, callback) {
    User.find({nickname : nickname}).remove(callback);
}

function logout(req, res) {
    if(req.session.user.loggedIn == 'local')
        deleteUser(req.session.user.nickname, function() {
            req.session.destroy();
            res.redirect('/');
        });
    
    else {
        req.session.destroy();
        res.redirect('/');
    }
}

function joinRoom(socket, roomName, nickname, color, io) {
    socket.join(roomName);

    Room.findOne({name : roomName}, function(err, room) {
        if(err)
            return handleError(err);
        
        if(!room) { //if user is alone in a room and refreshes, it is destroyed and they are sent to /rooms
            io.to(roomName).emit('room leave', nickname);
            return console.log('ERR: room to join not found');
        }

        room.curMembers ++;
        room.members[nickname] = color;
        room.markModified('members'); //mongoose doesnt detet the change in Object types, so this should be done manually
        
        room.save(function(err) {
            if(err)
                return handleError(err);
            
            io.emit('room updated', room);
        });
    });

    io.to(roomName).emit('add member', {
        nickname : nickname,
        color : color
    });

    io.to(roomName).emit('chat message', {
        msg      : '*<span style="color:' + color + ';"><b>' + nickname + '</b></span> joined',
        nickname : '',
        color    : 'black'
    });
}

function leaveRoom(socket, nickname, color, io) {
    var rName = socket.client.request.session.roomName; //this variable only used locally //ask

    if(!rName)
        return;
    
    Room.findOne({name : rName}, function(err, room) {
        if(err)
            return handleError(err);
        
        if(!room)
            return console.log("No room found to be left");

        room.curMembers --;
        delete room.members[nickname];
        room.markModified('members');
        
        if(room.curMembers == 0)
            room.remove(function() {
                io.emit('room removed', rName);
            });

        else 
            room.save(function(err) {
                if(err)
                    return handleError(err);
                
                io.emit('room updated', room);
        
                io.to(rName).emit('chat message', {
                    msg      : '*<span style="color:' + color + ';"><b>' + nickname + '</b></span> left',
                    nickname : '',
                    color    : 'black'
                });
            });
        
        io.to(rName).emit('remove member', nickname);

        socket.client.request.session.roomName = '';
        io.emit('room leave', nickname); //tell client room has been successfully left and user can be redirected
        socket.disconnect();
    });
}
