
// setup my socket client
var socket = io();

// the controller
angular.module('MainCtrl', []).controller('MainController', function($scope) {

    //the user's chosen username
    $scope.userName = '';
    
    //bools to control app state
    $scope.showLogin = true;
    $scope.showLobby = false;
    $scope.showGame = false;
    $scope.isPlayerTurn = false;
    
    //numbers to handle move types
    $scope.cardIndex = -1;
    $scope.areaIndex = -1;
    
    //arrays to hold the users who are on the server and the games in progress
    $scope.usersOnline = [];
    
    $scope.myGames = []; //do we want users to have the ability to play more than one game at a time?
    
    //a reference to the active game
    $scope.serverGame = null; 
    
    //current player numbers
    $scope.playerNum = -1;
    $scope.otherPlayerNum = -1;
    
    //a 'console' of sorts to debug the logic of the game - this is temporary
    $scope.console = '';
    
    //called when a user puts in their username and clicks the button
    $scope.onLogin = function(){
        
        if ($scope.userName.length > 0) {
            //$('#userLabel').text(username);
            socket.emit('login', $scope.userName);
            $scope.showLogin = false;
            $scope.showLobby = true;    
            
        }
        
    };
    
    $scope.submitPlay = function(){
        
        console.log('card: '+ $scope.cardIndex);
        console.log('area: '+ $scope.areaIndex);
        socket.emit('move', {game: $scope.serverGame, 
                             move:[$scope.cardIndex, $scope.areaIndex],
                            player: $scope.playerNum}
        );
        
        //$scope.isPlayerTurn = false;
        
    };
    
    socket.on('login', function(msg) {
        $scope.usersOnline = msg.users;
        updateUserList();
                
        $scope.myGames = msg.games;
        updateGamesList();
    });

    socket.on('joinlobby', function (msg) {
        addUser(msg);
    });
    
    socket.on('leavelobby', function (msg) {
        removeUser(msg);
        
    });
    
    socket.on('gameadd', function(msg) {
                
        
    });
    
    socket.on('move', function(msg) {
        
        console.log('move message received');
                
        if(msg.game.id === $scope.serverGame.id) 
        {
            $scope.serverGame = msg.game;
            
            if(msg.player === $scope.playerNum){
            
                var consoleString = "My Playing Area:" + "\n" +
                                     "Hand:" + msg.hand + "\n";
                consoleString += "km:" + msg.board.playingArea[$scope.playerNum].km + "\n" +
                                     "car status:" + msg.board.playingArea[$scope.playerNum].carStatus + "\n" +
                                     "safeties:" +msg.board.playingArea[$scope.playerNum].safeties + "\n" +
                                     "speed:" +msg.board.playingArea[$scope.playerNum].speed + "\n" +
                                     "score:" +msg.board.playingArea[$scope.playerNum].score + "\n";
                
                consoleString += "Opponent:" + "\n" +
                                    "km:" + msg.board.playingArea[$scope.otherPlayerNum].km + "\n" +
                                     "car status:" + msg.board.playingArea[$scope.otherPlayerNum].carStatus + "\n" +
                                     "safeties:" +msg.board.playingArea[$scope.otherPlayerNum].safeties + "\n" +
                                     "speed:" +msg.board.playingArea[$scope.otherPlayerNum].speed + "\n" +
                                     "score:" +msg.board.playingArea[$scope.otherPlayerNum].score + "\n";
                                     
                                     
                $scope.console = consoleString;
        
        }
        
        //IDEA - Check here if the previous move was either a safety or satisfies conditions
        //for a coup-forre
        
        //socket.emit('checkForSpecialMove', {});
        
        
        
        //workaround to get Angular to play nice with Socket.io
        //this actually applies the value so that the corresponding element will react
            
            $scope.$apply(function() { 
                
                $scope.isPlayerTurn = ($scope.serverGame.turn === $scope.playerNum);
            });
            
        
        }
        
        
    });
    
    socket.on('movesuccessful', function(msg)
        {
            if(msg.success) {
                console.log('move registered successfully');
                
                $scope.$apply(function() { 
                
                    $scope.isPlayerTurn = false;
                });
            }
        });


    socket.on('joingame', function(msg) {
        console.log("joined as game id: " + msg.game.id );   
        $scope.playerNum = msg.player;
        console.log($scope.playerNum);
        $scope.playerNum === 0 ? $scope.otherPlayerNum = 1 : $scope.otherPlayerNum = 0;
        var consoleString = "My Playing Area:" + "\n" +
                             "Hand:" + msg.hand + "\n";
        consoleString += "km:" + msg.board.playingArea[$scope.playerNum].km + "\n" +
                             "car status:" + msg.board.playingArea[$scope.playerNum].carStatus + "\n" +
                             "safeties:" +msg.board.playingArea[$scope.playerNum].safeties + "\n" +
                             "speed:" +msg.board.playingArea[$scope.playerNum].speed + "\n" +
                             "score:" +msg.board.playingArea[$scope.playerNum].score + "\n";
        
        consoleString += "Opponent:" + "\n" +
                            "km:" + msg.board.playingArea[$scope.otherPlayerNum].km + "\n" +
                             "car status:" + msg.board.playingArea[$scope.otherPlayerNum].carStatus + "\n" +
                             "safeties:" +msg.board.playingArea[$scope.otherPlayerNum].safeties + "\n" +
                             "speed:" +msg.board.playingArea[$scope.otherPlayerNum].speed + "\n" +
                             "score:" +msg.board.playingArea[$scope.otherPlayerNum].score + "\n";
        
    
        
        //workaround to get Angular to play nice with Socket.io
        $scope.$apply(function() { 
            $scope.showLobby = false;
            $scope.console = consoleString;
                
            
            console.log(msg.board);
            $scope.showGame = true; 
            $scope.serverGame = msg.game;
            $scope.isPlayerTurn = ($scope.playerNum === $scope.serverGame.turn);
        });
        
    });


    //MENU AND SETUP (WEB ELEMENT INTERACTION STUFF)


    var updateGamesList = function() {
        document.getElementById('gamesList').innerHTML = '';
        $scope.myGames.forEach(function(game) {
        $('#gamesList').append($('<button>')
                        .text('#'+ game)
                        .on('click', function() {
                             socket.emit('resumegame',  game);
                        }));
        });
    };
      
    var updateUserList = function() {
        document.getElementById('userList').innerHTML = '';
        $scope.usersOnline.forEach(function(user) {
            $('#userList').append($('<button class="btn btn-default">')
                        .text(user)
                        .on('click', function() {
                              socket.emit('invite',  user);
                        }));
        });
    };

    var addUser = function(userId) {
        $scope.usersOnline.push(userId);
        updateUserList();
    };

    var removeUser = function(userId) {
          for (var i=0; i<$scope.usersOnline.length; i++) {
            if ($scope.usersOnline[i] === userId) {
                $scope.usersOnline.splice(i, 1);
            }
         }
         
         updateUserList();
     };
    
    //--------Experimental - drag/drop implementation-----------
     
    // array for dropped items
    $scope.dropped = [];
 
    // array of items for dragging
    $scope.items = [
        {id: 1, name: "DRVACE", img: "assets/mm_card_drivingAce.jpg"}, 
        {id: 2, name: "200", img: "assets/mm_card_200km.jpg"},
        {id: 3, name: "GO", img: "assets/mm_card_go.jpg"},
        {id: 4, name: "RP", img: "assets/mm_card_repairs.jpg"}
    ];
 
    $scope.moveToBox = function(id) {
 
        for (var index = 0; index < $scope.items.length; index++) {
 
            var item = $scope.items[index];
                 
            if (item.id == id) {
                // add to dropped array
                $scope.dropped.push(item);
 
                // remove from items array
                $scope.items.splice(index, 1);
            }
        }
 
        $scope.$apply();
    };
 
    $scope.showItmesLeft = function () {
        alert($scope.items.length + " items left.");
    };
     
    $scope.showItmesDropped = function () {
        alert($scope.dropped.length + " items in drop-box.");
    };
    
}); //end of controller definition



