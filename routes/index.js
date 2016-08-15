var User = require('../models/user.js');
var Room = require('../models/room.js');

module.exports = function(app, passport, io) {

    var defaultNsp   = io.of('/');          //the '/'          namespace
    var roomsListNsp = io.of('/roomsList'); //the '/roomsList' namespace
    var chatNsp      = io.of('/chat');      //the '/chat'      namespace

    app.get('/', function(req, res) {
        if(req.session.nickname)
            res.render('index.ejs', {
                session : req.session
            });
        else
            res.render('initialize.ejs');
    });

    app.post('/', function(req, res) {
        var nickname = req.body.nickname;
        var color    = req.body.color;

        User.findOne({nickname : nickname}, function(err, user) {
            if(err)
                return handleError(err);
            
            if(user)
                return res.json({nicknameIsFree : 'false'});

            var newUser = new User({
                nickname : nickname,
                color    : color
            });

            newUser.save(function(err) {
                if(err)
                    return console.log(err);
                
                req.session.nickname = req.body.nickname;
                req.session.color    = req.body.color;
                res.json({nicknameIsFree : 'true'});
            });
        });
    });

    app.get('/f', function(req, res) {
        User.find({}).remove(function() {});
        res.send('done');
    });

    app.get('/destroySession', ensureHasNickname, destroySession);

    app.get('/rooms', ensureHasNickname, function(req, res) {
        Room.find({}, function(err, roomsList) {
            if(err)
                return handleError(err);

            res.render('rooms.ejs', {
                roomsList : roomsList,
                session : req.session
            }); 
        });
    });
    
    app.post('/rooms', ensureHasNickname, function(req, res) {
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
           
            newRoom.save(function(err) {
                if(err)
                    console.log(err);
                
                roomsListNsp.emit('room created', newRoom);
                                
                res.redirect('/rooms/' + req.body.newRoomNameField);
             });
        });
    });

    app.get('/rooms/:roomName', ensureHasNickname, function(req, res) {
        var roomName = req.params.roomName;
        Room.findOne({name : roomName}, function(err, room) {
            if(err)
                return handleError(err);
            
            if(!room) {
                res.redirect('/rooms');
                return;
            }

            res.render('room.ejs', {
                session : req.session,
                room : room
            });
        });
    });
    
    defaultNsp.on('connection', function(socket) {
        socket.on('disconnect', function() {
            deleteUser(socket.client.request.session.nickname, function() {});
        });
    });

    roomsListNsp.on('connection', function(socket) {
        var nickname = socket.client.request.session.nickname;
        var color    = socket.client.request.session.color;

        socket.on('disconnect', function() {
            deleteUser(socket.client.request.session.nickname, function() {});
        });
    });

    chatNsp.on('connection', function(socket) {
        socket.on('room join', function(roomNameParam) {
            var nickname = socket.client.request.session.nickname;
            var color    = socket.client.request.session.color;
            var roomName = socket.client.request.session.roomName = roomNameParam;

            joinRoom(socket, roomName, nickname, color, chatNsp, roomsListNsp);
            
            socket.on('chat message', function(msg) {
                chatNsp.to(roomName).emit('chat message', {
                    msg      : msg,
                    nickname : nickname,
                    color    : color
                });
            });

            socket.on('room leave', function() {
                leaveRoom(socket, nickname, color, chatNsp, roomsListNsp); //idempotent
            });
            socket.on('disconnect', function() {
                leaveRoom(socket, nickname, color, chatNsp, roomsListNsp);
                deleteUser(socket.client.request.session.nickname, function() {});
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

function deleteUser(nickname, callback) {
    User.find({nickname : nickname}).remove(callback);
}

function destroySession(req, res) {
    deleteUser(req.session.nickname, function() {
        req.session.destroy();
        res.redirect('/');
    });
}

function joinRoom(socket, roomName, nickname, color, chatNsp, roomsListNsp) {
    socket.join(roomName);

    Room.findOne({name : roomName}, function(err, room) {
        if(err)
            return handleError(err);
        
        if(!room)
            return console.log('ERR: room to join not found');

        room.curMembers ++;
        
        room.save(function(err) {
            if(err)
                return handleError(err);
            
            roomsListNsp.emit('room updated', room);
        });
    });

    chatNsp.to(roomName).emit('chat message', {
        msg      : '*<span style="color:' + color + ';"><b>' + nickname + '</b></span> joined',
        nickname : '',
        color    : 'black'
    });
}

function leaveRoom(socket, nickname, color, chatNsp, roomsListNsp) {
    var rName = socket.client.request.session.roomName;//this variable only used locally //ask

    if(!rName)
        return;
    
    Room.findOne({name : rName}, function(err, room) {
        if(err)
            return handleError(err);
        
        if(!room)
            return console.log("No room found to be left");

        room.curMembers --;
        
        if(room.curMembers == 0)
            room.remove(function() {
                roomsListNsp.emit('room removed', rName);
            });

        else 
            room.save(function(err) {
                if(err)
                    return handleError(err);
                
                roomsListNsp.emit('room updated', room);
        
                chatNsp.to(rName).emit('chat message', {
                    msg      : '*<span style="color:' + color + ';"><b>' + nickname + '</b></span> left',
                    nickname : '',
                    color    : 'black'
                });
            });

        socket.client.request.session.roomName = '';
        chatNsp.emit('room leave', nickname); //tell client room has been successfully left and user can be redirected
        socket.disconnect();
    });
}
