// server.js

// set up ======================================================================
// get all the tools we need
// var chatserver= require('./chat-server');
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var path = require('path');
// var api = require('./api');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');


//NEW VARS
var Http = require('http');
var Sockets = require('socket.io');
var chat_session_1 = require('./chat-session');
var chat_commands_1 = require('./chat-commands');
var http = Http.createServer(app);
var io = Sockets(http);
var commands = chat_commands_1.default(io, chat_session_1.default);

var configDB = require('./config/database.js');
const { config } = require('process');

// configuration ===============================================================

console.log(configDB.url)
mongoose.connect(configDB.url, function (err) {

}); // connect to our database

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log('open')
});

require('./config/passport')(passport); // pass passport for configuration

app.configure(function () {

    // set up our express application
    app.use(express.logger('dev')); // log every request to the console
    app.use(express.cookieParser()); // read cookies (needed for auth)
    app.use(express.bodyParser()); // get information from html forms

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs'); // set up ejs for templating

    // required for passport
    app.use(express.session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret

    app.use(express.static(path.join(__dirname, '')));

    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session
    // app.use('/api', api.api);
});

// routes ======================================================================
// load our routes and pass in our app and fully configured passport

var routers = require('./app/routes.js')(app, passport);
// console.log(routers.finalName);

// launch ======================================================================
io.on('connection', function (socket) {
    var player;
    socket.on('sync-store', function () {
        socket.emit('sync-store', JSON.stringify(chat_session_1.default));
    });
    socket.on('register', function (uuid, uName) {
        if (uName.length < 2) {
            uName = 'guest' + (chat_session_1.default.count + 1);
        }
        var puser;
        var tempNick;
        for (puser in chat_session_1.default.users) {
            if (uName == chat_session_1.default.users[puser].nick) {
                tempNick = uName;
                uName = 'guest' + (chat_session_1.default.count + 1);
            }
        }
        socket.emit('sync-store', JSON.stringify(chat_session_1.default));
        if (!(player = chat_session_1.default.users[uuid])) {
            chat_session_1.default.count++;
            player = chat_session_1.default.users[uuid] = {
                uuid: uuid,
                tabs: 0,
                nick: uName,
                socket: socket,
                type: 'user',
                currentChat: '#soccer',
                quit: false
            };
            io.sockets.emit('nickname', player.nick);
            if (player.nick == 'guest1') {
                player.type = 'sysop';
            }
        }
        else {
            player = chat_session_1.default.users[uuid];
            socket.emit('message', 'System: Welcome back ' + player.nick + '!', '#anouncements');
            if (!player.disconnected) {
                player.tabs++;
                socket.disconnect();
            }
        }
        if (player.disconnected) {
            clearTimeout(player.timeout);
            player.disconnected = false;
        }
        chat_session_1.default.users[uuid] = player;
        io.sockets.emit('addUser', player.nick);
    });
    socket.on('disconnect', function (type) {
        if (type == 'booted' && player.tabs > 0)
            return;
        player.disconnected = true;
        player.timeout = setTimeout(function () {
            if (player.disconnected) {
                delete chat_session_1.default.users[player.uuid];
                chat_session_1.default.count--;
            }
        }, 2000);
        io.sockets.emit('removeUser', player.nick);
    });
    socket.on('message', function (msg, channel) {
        if (!commands.isCommand(msg) && !player.quit) {
            var out = player.nick + ': ' + msg;
            io.emit('message', out, channel);
            var curChannel = chat_session_1.default.channels[channel];
            if (curChannel)
                curChannel.messages.push(out);
            console.log(chat_session_1.default.channels[channel]);
        }
        else if (commands.isCommand(msg)) {
            commands.run(player, msg);
        }
        else {
            return;
        }
    });
    socket.on('channelChange', function (channel) {
        player.currentChat = channel;
        console.log(player.nick + ' moved to channe: ' + player.currentChat);
    });
});
var port1 = 8082;
http.listen(port1);


app.listen(port);
console.log('The magic happens on port ' + port);

function yourFunction() {
    console.log(mongoose.connection.readyState);

    setTimeout(yourFunction, 2500);
}

yourFunction()
