
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

//Megameter game instance ===========================
var megameter;

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
        megameter = new Megameter(game);
        activeGames[game.id] = megameter;
        
        //don't remember what this does...
        users[game.users.player1].games[game.id] = game.id;
        users[game.users.player2].games[game.id] = game.id;
  
        console.log('starting game: ' + game.id);
        
        lobbyUsers[game.users.player1].emit('joingame', {game: game, board: megameter.board, hand: megameter.hands.hand0, player: 0});
        lobbyUsers[game.users.player2].emit('joingame', {game: game, board: megameter.board, hand: megameter.hands.hand1, player: 1});
        
        delete lobbyUsers[game.users.player1];
        delete lobbyUsers[game.users.player2];   
        
        socket.broadcast.emit('gameadd', {gameId: game.id, gameState:game});
        console.log(megameter.game.turn);
    });
    
    //TODO - MAJOR ISSUE - TURN SWITCHING NOT WORKING AT ALL
    
    socket.on('move', function(msg) {
        
        //rename the working Megameter game instance for readability 
        var thisGame = activeGames[msg.game.id];
        
        //if it's the correct player's turn and the move is legal....
        if(msg.player === thisGame.game.turn && 
           thisGame.playCard(msg.move[0], msg.move[1], msg.player)){
            
            var activeHand, otherHand;
            thisGame.game.turn === 0 ? (activeHand = thisGame.hands.hand0,
                                        otherHand = thisGame.hands.hand1): 
                                  (activeHand = thisGame.hands.hand1,
                                   otherHand = thisGame.hands.hand0);
            
            //does the move create a winner?  if so - init the endGame state
            //note that hasWinner also tallies the score
            if(thisGame.hasWinner()){
                var winningPlayerNum = thisGame.board.playingArea[0].score >= 1000 ? 0 : 1;
                console.log('Player ' + winningPlayerNum + ' has won');
            }
            // declare winner
            
            else{          
                //swap whose turn it is if a safety was not played
                if(thisGame.safetyWasPlayed === false){
                    thisGame.game.turn === 0 ? (thisGame.game.turn = 1, 
                                           activeHand = thisGame.hands.hand1,
                                               otherHand = thisGame.hands.hand0): 
                                           (thisGame.game.turn = 0, 
                                           activeHand = thisGame.hands.hand0,
                                           otherHand = thisGame.hands.hand1);
                }
                
                //deal a card to the next player (if there is one left)
                var nextCard = thisGame.deck.dealOne();
                if(nextCard !== null)
                    activeHand.push(nextCard);

                //send out game state info - TODO - should only call this once - make it so player matches whose turn it is?
                socket.broadcast.emit('move', {game: thisGame.game, board: thisGame.board, hand: activeHand});
                //socket.broadcast.emit('move', {game: thisGame.game, board: thisGame.board, hand: thisGame.hands.hand1, player: 1});

                //send this to the caller to tell them it's no longer their turn
                socket.emit('movesuccessful', {success: true, game: thisGame.game, board: thisGame.board, hand: otherHand});
                console.log(thisGame.game.turn);
            }
        }
       
    });
    
    
    
});


// =========== MEGAMETER - CORE FUNCTIONALITY =====================

var Megameter = function(game){
    
    //the game info from socket
    this.game = game;
    
    //create a new deck for this game to use
    this.deck = new Deck();
    
    //the hands for each player, simply represented as an array of Strings
    this.hands = {
        hand0: this.deck.dealHand(),
        hand1: this.deck.dealHand()
    };
    
    //first draw card for player going first
    this.hands.hand1.push(this.deck.dealOne());  
    
    //The playing area/game state object
    //TODO - these need to eventually support more than 2 players
    this.board = {
        
        playingArea: [
            {
                discard: [],
                km: [],
                carStatus: [],
                safeties: [],
                speed: [],
                score: 0
            },
            {
                discard: [],
                km: [],
                carStatus: [],
                safeties: [],
                speed: [],
                score: 0
            },
        ]
    };
    
    // a flag to control whether or not a safety was just played for bonus turn purposes
    this.safetyWasPlayed = false;
    
}

/**
 *   Playing areas ==> 0 = discard, 1 = km, 2 = car status, 3 = safeties, 4 = speed, 5 = opponent car status, 6 = opponent speed
 * 
 */ 

/**---------validateMove method---------------
 *  
 *  Validates the requested move.  If the move is legal, true is returned, false otherwise
 *  card = the index of the card to play, area = the index of the playing area to play it to 
 *  player = the number of the player requesting the move 
 * 
 *  TODO - Check for safety cards on the opponent
 * 
 */
  
Megameter.prototype.validateMove = function(card, area, player){
    
    var hand;
    player === 0 ? hand = this.hands.hand0 : hand = this.hands.hand1;
    var desiredCard = hand[card];
    var status = this.board.playingArea[player].carStatus;
    status.length === 0 ? status = null : status = status[status.length-1];
    
    var otherPlayer;
    player === 0 ? otherPlayer = 1 : otherPlayer = 0;
    var otherSafeties = this.board.playingArea[otherPlayer].safeties;
    otherSafeties.length === 0 ? otherSafeties = null : otherSafeties = otherSafeties[otherSafeties.length-1];
    
    //check for completely outlandish entries
    if(card < 0 || card > 6 || area < 0 || area > 6 || player < 0 || player > 3) return false;
    
    //check for correct area
    if(Number(area) === 0) return true;  //discard is always ok 
    
    if(Number(area) === 1 && typeof desiredCard === 'number' && status === 'GO')  {
        var answer;
        (this.board.playingArea[player].speed.length === 0 || 
        this.board.playingArea[player].speed[this.board.playingArea[player].speed.length-1] === 'ENDSL') ? answer = true : answer = desiredCard <= 50;
        return answer;
    }
    
    if(Number(area) === 2)  //remedy
    {
        if(desiredCard === 'GO' && 
        (status === null || status === 'STP' || status === 'GS' || status === 'ST' || status === 'RP')){
            return true;
        }
        
        if(desiredCard === 'GS' && status === 'OOG') return true;
        
        if(desiredCard === 'ST' && status === 'FLT') return true;
        
        if(desiredCard === 'RP' && status === 'ACC') return true;
        
    }
    
    if(Number(area) === 3 && 
    (desiredCard === 'RGTWAY' || desiredCard === 'DRVACE' || desiredCard === 'PNCPRF' || desiredCard === 'EXTANK')) //safety 
        return true;
    
    if(Number(area) === 4 && desiredCard === 'ENDSL') return true;
    
    if(Number(area) === 5 && (desiredCard === 'OOG' || desiredCard === 'FLT' || desiredCard === 'ACC' || desiredCard === 'STP')){
        
        if(desiredCard === 'OOG' && (otherSafeties === null || otherSafeties.indexOf('EXTANK') === -1)) return true;
        if(desiredCard === 'FLT' && (otherSafeties === null || otherSafeties.indexOf('PNCPRF') === -1)) return true;
        if(desiredCard === 'ACC' && (otherSafeties === null || otherSafeties.indexOf('DRVACE') === -1)) return true;
        if(desiredCard === 'STP' && (otherSafeties === null || otherSafeties.indexOf('RGTWAY') === -1)) return true;
    }
        
        
    if(Number(area) === 6 && desiredCard === 'SPDL') {
        if(otherSafeties === null || otherSafeties.indexOf('RGTWAY') === -1) return true;
    }
    
    return false;
    
};

/**---------playCard method---------------
 *  
 *  First validates the requested move.  If the move is legal, the requested move is played
 *  and the game board (state) is updated. 
 *  card = the index of the card to play, area = the index of the playing area to play it to 
 *  player = the number of the player requesting the move 
 * 
 */

Megameter.prototype.playCard = function(card, area, player){
    
    if(!this.validateMove(card, area, player)) {
        console.log("Move by player " + player + " did not validate.");
        return false;
    }
    
    //Resetting the safety flag each turn
    this.safetyWasPlayed = false;
    
    var hand;
    player === 0 ? hand = this.hands.hand0 : hand = this.hands.hand1;
    var desiredCard = hand[card];
    var otherPlayer;
    player === 0 ? otherPlayer = 1 : otherPlayer = 0;
    
    switch(Number(area)){
        
        case 0:
            break;
        case 1:
            this.board.playingArea[player].km.push(desiredCard);
            break;
        case 2:
            this.board.playingArea[player].carStatus.push(desiredCard);
            break;
        case 3:
            this.board.playingArea[player].safeties.push(desiredCard);
            //TODO - remove matching hazard card from pile and take a bonus turn
            this.safetyWasPlayed = this.applySafetyEffects(desiredCard, player);
            break;
        case 4:
            this.board.playingArea[player].speed.push(desiredCard);
            break;
        case 5:
            this.board.playingArea[otherPlayer].carStatus.push(desiredCard);
            //TODO - trigger a coup-forre if appropriate
            break;
        case 6:
            this.board.playingArea[otherPlayer].speed.push(desiredCard);
            break;
        default:
            break;
            
    }
    
    hand.splice(card,1);
    
    console.log("Move by player " + player + " successful.");
    return true;
};

/**---------hasWinner method---------------
 *  
 *  Checks the game state to see if a player has won
 *  Also tallies the scores
 */
 
 Megameter.prototype.hasWinner = function(){
     
     this.board.playingArea[0].score = 0;
     this.board.playingArea[1].score = 0;
     
     for(var i=0; i<this.board.playingArea[0].km.length; i++)
     {
         this.board.playingArea[0].score += this.board.playingArea[0].km[i];
     }
     
     for(var j=0; j<this.board.playingArea[1].km.length; j++)
     {
         this.board.playingArea[1].score += this.board.playingArea[1].km[j];
     }
     
     return this.board.playingArea[0].score >= 1000 || this.board.playingArea[1].score >= 1000;
    
};

/**---------getBoardState method---------------
 *  
 *  Returns the state of the board as an object which can then be parsed by the client
 * 
 */

Megameter.prototype.getBoardState = function(){
    return this.board;
};

/**--------applySafetyEffects----------
 *
 *  Helper method to apply the safety card effects to the game board
 *  card is a String or a Number that represents a card type (200, 'ENDSL', 'GO', etc)
 */

Megameter.prototype.applySafetyEffects = function(card, playerNum){
    
    //convenience variables for use later
    var statusPile = this.board.playingArea[playerNum].carStatus;
    var statusLen = this.board.playingArea[playerNum].carStatus.length;
    
    //In the following, the attack types are put in the order as the safeties that remove them
    var safeties = this.deck.safetyCards;
    var attackTypes = ['STP', 'ACC', 'FLT', 'OOG'];
    
    //Get the index of the safety in question, which will in turn also get the corresponding attack card
    var index = safeties.indexOf(card);
    
    //Just in case a non-safety is passed to this function
    if(index < 0) return false;
    
    //splice off the last card off the status pile if it's the corresponding attack card
    if(statusPile[statusLen-1] === attackTypes[index]) statusPile.splice(statusLen-1, 1);
    
    //TODO:  Apply a GO effect if the safety played is Right of Way
    if(card === 'RGTWAY') statusPile.push('GO');
    
    return true; //a safety was successfully played
}


//======== DECK FUNCTIONALITY ==============

// Create the deck

/**
 *  CARD TYPES:
 *  25, 50, 75, 100, 200 = km cards (numbers)
 *  Gas, Spare Tire, Repairs, Go = remedy cards ==> 'GS', 'ST', 'RP', 'GO'
 *  Out of Gas, Flat Tire, Accident, Stop = attack cards ==> 'OOG', 'FLT', 'ACC', 'STP'
 *  Speed Limit = speed attack card ==> 'SPDL'
 *  End of Speed Limit = speed card ==> 'ENDSL'
 *  Right of Way, Driving Ace, Puncture-Proof Tires, Extra Tank - Safeties ==> 'RGTWAY', 'DRVACE', 'PNCPRF', 'EXTANK'  
 */ 

var Deck = function(){
    
    this.numberCards = [200, 200, 200, 200, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 
      75, 75, 75, 75, 75, 75, 75, 75, 75, 75, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25];
    this.remedyCards = ['GS','GS','GS','GS','GS', 'GS', 'ST', 'ST','ST', 'ST','ST', 'ST', 'RP','RP','RP','RP','RP','RP',
      'GO', 'GO', 'GO', 'GO', 'GO', 'GO', 'GO','GO', 'GO', 'GO', 'GO', 'GO', 'GO', 'GO'];
    this.attackCards = ['OOG','OOG','OOG', 'FLT','FLT','FLT', 'ACC','ACC','ACC', 'STP', 'STP', 'STP', 'STP', 'STP'];
    this.speedLimitCards = ['SPDL','SPDL','SPDL','SPDL'];
    this.speedCards = ['ENDSL', 'ENDSL', 'ENDSL', 'ENDSL', 'ENDSL','ENDSL'];
    this.safetyCards = ['RGTWAY', 'DRVACE', 'PNCPRF', 'EXTANK'];
    this.cards = this.numberCards.concat(this.remedyCards).concat(this.attackCards).concat(this.speedLimitCards).concat(this.speedCards).concat(this.safetyCards);
    
    
    //push all of the cards onto the deck
};

//Deal out starting hands 

Deck.prototype.dealHand = function(){
    
    //shuffle the Deck
    shuffle(this.cards);
    var hand = [];  //TODO - again - bad.  expand for more players
    
    //create two arrays from the deck of cards
    for(var i = 0; i< 6; i++)
    {
        hand.push(this.dealOne());
    }
    
    return hand;
};

//Deal the top card off of the deck to a player (or null if there are no cards left) 

Deck.prototype.dealOne = function(){
    
    //pop the top card off of the deck and return it if there are cards left
    if(this.cards.length !== 0){
        var card = this.cards[0];
        this.cards.splice(0,1);
        return card;
    }
    
    return null;
};

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}
