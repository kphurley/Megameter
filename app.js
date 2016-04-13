
// modules =================================================
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');

// configuration ===========================================
    
// config files
var db = require('./config/db');

// set our port
var port = process.env.PORT || 8080; 

// connect to our mongoDB database 
// (uncomment after you enter in your own credentials in config/db.js)
// mongoose.connect(db.url); 

// get all data/stuff of the body (POST) parameters
// parse application/json 
app.use(bodyParser.json()); 

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public')); 

// routes ==================================================
require('./app/routes')(app); // configure our routes

// start app ===============================================
// startup our app at http://localhost:8080
server.listen(port);               

// shoutout to the user                     
console.log('Listening on port ' + port);

// expose app           
exports = module.exports = app;     

//socket.io login handling =============================

var lobbyUsers = {};
var users = {};
var activeGames = {};

io.on('connection', function(socket) {
    console.log('New connection');
    
    //socket.broadcast.emit('map', DEFAULT_MAP);
 
    socket.on('message', function(msg) {
        console.log('Got message from client: ' + msg);
        socket.broadcast.emit('response', msg);
    });
    
    socket.on('login', function(userId) {
        console.log(userId + ' joining lobby');
        socket.userId = userId;  
     
        if (!users[userId]) {    
            console.log('creating new user');
            users[userId] = {userId: socket.userId, games:{}};
        } else {
            console.log('user found!');
            Object.keys(users[userId].games).forEach(function(gameId) {
                console.log('gameid - ' + gameId);
            });
        }
        
        socket.emit('login', {users: Object.keys(lobbyUsers), 
                              games: Object.keys(users[userId].games)});
        lobbyUsers[userId] = socket;
        
        socket.broadcast.emit('joinlobby', socket.userId);
    });
    
    socket.on('invite', function(opponentId) {
        console.log('got an invite from: ' + socket.userId + ' --> ' + opponentId);
        
        socket.broadcast.emit('leavelobby', socket.userId);
        socket.broadcast.emit('leavelobby', opponentId);
        
        //TODO - This should call the Megameter constructor which should return an object with the intial game state
        var game = {
            id: Math.floor((Math.random() * 100) + 1),
            users: {player1: socket.userId, player2: opponentId},
            turn: 1
        };
        
        
        socket.gameId = game.id;
        activeGames[game.id] = game;
        
        //don't remember what this does...
        users[game.users.player1].games[game.id] = game.id;
        users[game.users.player2].games[game.id] = game.id;
  
        console.log('starting game: ' + game.id);
        lobbyUsers[game.users.player1].emit('joingame', {game: game, player: 1});
        lobbyUsers[game.users.player2].emit('joingame', {game: game, player: 2});
        //createGame(game);
        
        delete lobbyUsers[game.users.player1];
        delete lobbyUsers[game.users.player2];   
        
        socket.broadcast.emit('gameadd', {gameId: game.id, gameState:game});
    });
    
    
    
    socket.on('move', function(msg) {
        
        socket.broadcast.emit('move', msg);
        //activeGames[msg.id].units = msg.units;  //syncs client units with server's
        //activeGames[msg.id].hands = msg.hands;  //syncs current hand state
        //activeGames[msg.id].mana = msg.mana;
        
        
    });
    
    
    
});