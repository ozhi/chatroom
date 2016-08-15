var User = require('../models/user.js');
var Room = require('../models/room.js');

module.exports = function(app, passport, io) {

    app.get('/', function(req, res) {
        if(req.session.nickname)
            res.render('index.ejs', {
                session : req.session
            });
        else
            res.render('initialize.ejs');
    });

    app.get('/isFree/:nickname', function(req, res) {
        var nickname = req.params.nickname;
        
        if(!(/^[a-z_][a-z0-9_]*$/gi).test(nickname))
            return res.json({msg : 'no special characters'});
        
        User.findOne({nickname : nickname}, function(err, user) {
            if(err)
                return handleError(err);
            
            console.log(user);
            
            res.json({
                msg : (user ? 'taken' : 'free')
            });
        });
    });

    app.post('/', function(req, res) {
        var nickname = req.body.nickname;
        var color    = req.body.color;

        User.findOne({nickname : nickname}, function(err, user) {
            if(err)
                return handleError(err);
            
            if(user)
                return res.json({nicknameIsFree : 'taken'});

            var newUser = new User({
                nickname : nickname,
                color    : color
            });

            newUser.save(function(err) {
                if(err)
                    return console.log(err);
                
                req.session.nickname = req.body.nickname;
                req.session.color    = req.body.color;
                res.json({nicknameIsFree : 'free'});
            });
        });
    });

    app.get('/f', function(req, res) {
        Room.find({}).remove(function() {});
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
                
                io.emit('room created', newRoom);
                                
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
    
    io.on('connection', function(socket) {
        var nickname = socket.client.request.session.nickname;
        var color    = socket.client.request.session.color;
        
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
            deleteUser(socket.client.request.session.nickname, function() {});
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

function joinRoom(socket, roomName, nickname, color, io) {
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
            
            io.emit('room updated', room);
        });
    });

    io.to(roomName).emit('chat message', {
        msg      : '*<span style="color:' + color + ';"><b>' + nickname + '</b></span> joined',
        nickname : '',
        color    : 'black'
    });
}

function leaveRoom(socket, nickname, color, io) {
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

        socket.client.request.session.roomName = '';
        io.emit('room leave', nickname); //tell client room has been successfully left and user can be redirected
        socket.disconnect();
    });
}
