'use strict';

var express = require('express');
var session = require('express-session');

var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/chatroom');
var mongoStore = require('connect-mongo')(session);
var sessionStore = new mongoStore({ mongooseConnection: mongoose.connection });

var path = require('path');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');
//var passportSocketIo = require('passport.socketio');
var cookieParser = require('cookie-parser');
var debug = require('debug')('chatroom:server');

var app = express();
var server = require('http').Server(app);

var sio = require('socket.io')(server);

var sessionMiddleware = session({
    secret: 'secret',
    store: sessionStore
});

sio.use(function (socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(sessionMiddleware);

// view engine setup
app.set('views', path.join(__dirname, 'lib/views'));
app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));//logs requests to the console
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'lib/public')));

require('./lib/config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // use connect-flash for flash messages stored in session

require('./lib/routes/index.js')(app, passport, sio);

server.listen(3000);

// development error handler, will print stacktrace
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.ejs', {
        message: err.message,
        error: err
    });
});
