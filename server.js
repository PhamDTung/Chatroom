//
/**
 * Module dependencies.
 */

var express = require('express');
// var routes = require('./routes');
// var user = require('./routes/user');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(bodyParser.urlencoded({ extened: true }));
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('combined'));
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
// gzip/deflate outgoing responses



// app.get('/', routes.index);
// app.get('/users', user.list);
app.get('/', function (req, res) {
    res.render("index");
});

var serve = http.createServer(app);
var io = require('socket.io')(serve);

serve.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

var mongo = require('mongodb').MongoClient;
var url = 'mongodb://tungchatroom:tungchatroom#@ds261247.mlab.com:61247/chatroom';
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('chat', function (msg) {
        socket.broadcast.emit('chat', msg);
        mongo.connect(url, function (err, db) {
            var collection = db.collection("messages");
            collection.insert({ content: msg }, function (err, res) {
                if (err) { console.log("Có lỗi"); }
                else { console.log("chat message inserted into db: " + msg); }
                // db.close();
            });
            var stream = collection.find().sort().limit(10).stream();
            stream.on('data', function (chat) { socket.emit('chat', chat.content); });
        });
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});















// Server = require('mongodb').Server;

// Set up the connection to the local db
// var mongoclient = new MongoClient(new Server("localhost", 27017), { native_parser: true });

// Open the connection to the server
// var url = 'mongodb://localhost:27017/Chatroom';
// MongoClient.connect(url, function (err, db) {
//     if(!err) {
//         console.log("We are connected");
//     } else console.log("Connect fail");
//     var collection = db.collection('chat messages');
//     io.on('connection', function (socket) {
//         console.log('a user connected');
//         socket.on('disconnect', function () {
//             console.log('user disconnected');
//         });
//         socket.on('chat', function (msg) {
//             socket.broadcast.emit('chat', msg);
//             collection.insert({ content: msg }, function(err, o) {
//                 if (err) { console.warn(err.message); }
//                 else { console.log("chat message inserted into db: " + msg); }
//             });
//         });

//     });
// });