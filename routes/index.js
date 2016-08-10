//var User = require('../models/user.js');
var Room = require('../models/room.js');

var colors = ['red', 'green', 'blue', 'brown', 'orange', 'gray' ]; //currently not used
var onlineUsers = {};

module.exports = function(app, passport, io) {

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

    app.get('/rooms', ensureHasNickname, function(req, res) {       
        res.render('rooms.ejs');
    });
    
    app.post('/rooms', ensureHasNickname, function(req, res) { //the problem that if you reload 'the page uses info you entered'
        var newRoom = new Room({
            name       : req.body.newRoomNameField,
            password   : req.body.newRoomPasswordField,
            maxMembers : req.body.newRoomMaxMembersField
        });
        //so what should we do?

        newRoom.save(function(err) {
            if(err)
                console.log(err);
            
            Room.find({}, function(err, roomsList) {
                if(err)
                    return handleError(err);
                                
                io.of('/rooms').emit('roomsList change', roomsList);
            });
            
            res.redirect('/rooms/' + req.body.newRoomNameField);
        });
    });

    app.get('/destroySession',    destroySession);
    
    io.sockets.on('connection', function(socket) {
        var nickname = socket.client.request.session.nickname;
        var color    = socket.client.request.session.color;

        console.log(nickname + ' has conneted to the / namespace');

        socket.join('_public');

        onlineUsers[nickname] = color;
        io.to('_public').emit('onlineUsers change', onlineUsers);

        io.to('_public').emit('chat message', {
            msg      : '*<span style="color:' + color + ';"><b>' + nickname + '</b></span> joined',
            nickname : '',
            color    : 'black'
        });

        socket.on('chat message', function(msg) {
            io.to('_public').emit('chat message', {
                msg      : msg,
                nickname : nickname,
                color    : color
            });
        });

        socket.on('disconnect', function() {
            delete onlineUsers[nickname];
            io.to('_public').emit('onlineUsers change', onlineUsers);
            io.to('_public').emit('chat message', {
                msg      : '*<span style="color:' + color + ';"><b>' + nickname + '</b></span> left',
                nickname : '',
                color    : 'black'
            });
        });
    });

    io.of('/rooms').on('connection', function(socket) {
        var nickname = socket.client.request.session.nickname; //could undefined
        var color    = socket.client.request.session.color;
        console.log(nickname + ' has connected to the /rooms namespace');

        socket.on('roomsList change', function(message) {
            Room.find({}, function(err, roomsList) {
                if(err)
                    return handleError(err);
                                
                io.of('/rooms').emit('roomsList change', roomsList);
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
