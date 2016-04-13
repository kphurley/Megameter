
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
    
    //a 'console' of sorts to debug the logic of the game - this is temporary
    $scope.console = 'TESTING';
    
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
                             move:[$scope.cardIndex, $scope.areaIndex]}
        );
        $scope.isPlayerTurn = false;
        
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
                
        console.log(msg.move);   
        $scope.console += "\n" + msg.move;
        //workaround to get Angular to play nice with Socket.io
        $scope.$apply(function() { 
            if(!$scope.isPlayerTurn)
              $scope.isPlayerTurn= true;
        });
    });


    socket.on('joingame', function(msg) {
        console.log("joined as game id: " + msg.game.id );   
        playerNum = msg.player;
        
        //workaround to get Angular to play nice with Socket.io
        $scope.$apply(function() { 
            $scope.showLobby = false;
            $scope.showGame = true; 
            $scope.serverGame = msg.game;
            if(playerNum === 1) $scope.isPlayerTurn = true;
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
    
});

