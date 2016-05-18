var express= require('express');
var compression = require('compression');
var path = require('path');
var cors = require('cors');


var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var feed = require('../feed.js');

var static_path = path.join(__dirname, './../build');

app.enable('trust proxy');

app.use(compression());


app.options('/api/currentTime', cors());
app.get('/api/currentTime', cors(), function(req, res) {
  res.send({ time: new Date() });
});

app.route('/').get(function(req, res) {
    res.header('Cache-Control', "max-age=60, must-revalidate, private");
    res.sendFile('index.html', {
        root: static_path
    });
});

function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

app.use('/', express.static(static_path, {
    maxage: 31557600
}));

var server = app.listen(process.env.PORT || 5000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

io.on('connection', function (socket) {
    console.log('User connected. Socket id %s', socket.id);

    socket.on('join', function (rooms) {
        console.log('Socket %s subscribed to %s', socket.id, rooms);
        if (Array.isArray(rooms)) {
            rooms.forEach(function(room) {
                socket.join(room);
            });
        } else {
            socket.join(rooms);
        }
    });

    socket.on('leave', function (rooms) {
        console.log('Socket %s unsubscribed from %s', socket.id, rooms);
        if (Array.isArray(rooms)) {
            rooms.forEach(function(room) {
                socket.leave(room);
            });
        } else {
            socket.leave(rooms);
        }
    });

    socket.on('disconnect', function () {
        console.log('User disconnected. %s. Socket id %s', socket.id);
    });
});

feed.start(function(room, type, message) {
    io.to(room).emit(type, message);
});

http.listen(3000, function () {
    console.log('listening on: 3000');
});