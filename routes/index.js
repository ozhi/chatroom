//var User = require('../models/user.js');
var Room = require('../models/room.js');

module.exports = function(app, passport, io) {

    var roomsListNsp = io.of('/roomsList'); //the '/roomsList' namespace
    var chatNsp      = io.of('/chat');      //the '/chat'      namespace

    app.get('/', function(req, res) {
        if(req.session.nickname)
            res.render('index.ejs');
        else
            res.render('initialize.ejs');
    });

    app.post('/', function(req, res) {
        req.session.nickname = req.body.nickname;
        req.session.color    = req.body.color;
        res.end();
    });

    app.get('/destroySession', ensureHasNickname, destroySession);

    app.get('/rooms', ensureHasNickname, function(req, res) {       
        res.render('rooms.ejs');
    });
    
    app.post('/rooms', ensureHasNickname, function(req, res) { //the problem that if you reload 'the page uses info you entered'        
        Room.find({name : req.body.newRoomNameField}, function(err, result) {
            if(err)
                return HandleError(err);
            
            if(result.length) {
                res.redirect('/rooms'); //add explanation that a room with that name already exists
                return;
            }

            var newRoom = new Room({
                name       : req.body.newRoomNameField,
                password   : req.body.newRoomPasswordField,
                maxMembers : req.body.newRoomMaxMembersField,
                curMembers : 0
            });

            //console.log(req.body.newRoomMaxMembersField + "   " + parseInt(req.body.newRoomMaxMembersField));
           
            newRoom.save(function(err) {
                if(err)
                    console.log(err);
                
                Room.find({}, function(err, roomsList) {
                    if(err)
                        return handleError(err);
                                    
                    roomsListNsp.emit('roomsList change', roomsList);
                });
                
                res.redirect('/rooms/' + req.body.newRoomNameField);
             });
        });
    });

    app.get('/rooms/:roomName', ensureHasNickname, function(req, res) { //check for password
        var roomName = req.params.roomName;
        Room.findOne({name : roomName}, function(err, room) {
            if(err)
                return handleError(err);
            
            if(!room) {
                res.redirect('/rooms');
                return;
            }

            res.render('room.ejs', {
                room : room
            });
        });
    });
    
    io.sockets.on('connection', function(socket) { //the global ('/') namespace; //no msgs are emitted in this nsp
        var nickname = socket.client.request.session.nickname;
        var color    = socket.client.request.session.color;

        //console.log(nickname + " connected to the '/' namespace");

        socket.on('disconnect', function() {
            //console.log(nickname + " disconnected from the '/' namespace");
        });
    });

    roomsListNsp.on('connection', function(socket) {
        var nickname = socket.client.request.session.nickname;
        var color    = socket.client.request.session.color;
        console.log(nickname + ' connected to the /roomsList namespace');

        socket.on('roomsList change', function(message) {
            Room.find({}, function(err, roomsList) {
                if(err)
                    return handleError(err);
                                
                roomsListNsp.emit('roomsList change', roomsList);
            });
        });

        socket.on('disconnect', function () {
            console.log(nickname + ' disconnected from the /roomsList namespace');
        });
    });

    chatNsp.on('connection', function(socket) {
        var nickname = socket.client.request.session.nickname;
        var color    = socket.client.request.session.color;
        var roomName;

        console.log(nickname + " connected to the '/chat' namespace");

        socket.on('room join', function(roomNameParam) {
            roomName = socket.client.request.session.roomName = roomNameParam;

            addCurMembers(roomName, 1, function() {
                Room.find({}, function(err, roomsList) { //tell the ui sth has changed
                    if(err)
                        return handleError(err);
                                    
                    roomsListNsp.emit('roomsList change', roomsList);
                });
            });

            socket.join(roomName);
            console.log(nickname + " joined '" + roomName + "'");

            //chatNsp.to(roomName).emit('onlineUsers change', onlineUsers[roomName]);

            chatNsp.to(roomName).emit('chat message', {
                msg      : '*<span style="color:' + color + ';"><b>' + nickname + '</b></span> joined',
                nickname : '',
                color    : 'black'
            });

            socket.on('chat message', function(msg) {
                chatNsp.to(roomName).emit('chat message', {
                    msg      : msg,
                    nickname : nickname,
                    color    : color
                });
            });

            socket.on('disconnect', function() {
                console.log(nickname + " left " + roomName);
                console.log(nickname + " disconnected from the '/chat' namespace");
            
                addCurMembers(roomName, -1, function() {
                    Room.find({}, function(err, roomsList) { //tell the ui sth has changed
                        if(err)
                            return handleError(err);
                                        
                        roomsListNsp.emit('roomsList change', roomsList);
                    });
                });
                
                //chatNsp.to(roomName).emit('onlineUsers change', onlineUsers[roomName]);
                chatNsp.to(roomName).emit('chat message', {
                    msg      : '*<span style="color:' + color + ';"><b>' + nickname + '</b></span> left',
                    nickname : '',
                    color    : 'black'
                });
            });
        });
    });
};

function ensureHasNickname(req, res, next) {
    if (req.session.nickname)
        return next();       
    else
        res.redirect('/');
}

function destroySession(req, res) {
    req.session.destroy();
    res.redirect('/');
}

function addCurMembers(roomName, toAdd, cb) {
    if(toAdd != 1 && toAdd != -1)
        return; //this func is not supposed to be used like that
    
    Room.findOne({name : roomName}, function(err, room) {
        if(err)
            return handleError(err);
        
        if(!room) {
            console.log('ERR: room to update not found');
            return;
        }

        //console.log(room);
        if(room.curMembers + toAdd == 0) { //if the room becomes empty, delete it
            Room.find({name : roomName}).remove(cb);
            return;
        }

        Room.update(
            { name : roomName         },
            { $inc : {curMembers : toAdd} },
            cb
        );
    });

    // Room.update(
    //     { name : roomName         },
    //     { $inc : {curMembers : toAdd} },
    //     function(){}
    // );
}
