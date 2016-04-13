
// setup my socket client
var socket = io();

//arrays to hold the users who are on the server and the games in progress
var usersOnline = [];
var myGames = [];

// the controller
angular.module('MainCtrl', []).controller('MainController', function($scope) {

    $scope.userName = '';
    $scope.showLogin = true;
    $scope.showLobby = false;
    $scope.showGame = false;
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
    
    //called when a user clicks on another user
    $scope.initGame = function(game){
        
        $scope.showLobby = false;
        $scope.showGame = true;
        
    };
    
    socket.on('login', function(msg) {
        usersOnline = msg.users;
        updateUserList();
                
        myGames = msg.games;
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


    socket.on('joingame', function(msg) {
        console.log("joined as game id: " + msg.game.id );   
        playerNum = msg.player;
        $scope.$apply(function() { 
            $scope.showLobby = false;
            $scope.showGame = true; 
            
        });
        
    });


    //MENU AND SETUP (WEB ELEMENT INTERACTION STUFF)


    var updateGamesList = function() {
        document.getElementById('gamesList').innerHTML = '';
        myGames.forEach(function(game) {
        $('#gamesList').append($('<button>')
                        .text('#'+ game)
                        .on('click', function() {
                             socket.emit('resumegame',  game);
                        }));
        });
    };
      
    var updateUserList = function() {
        document.getElementById('userList').innerHTML = '';
        usersOnline.forEach(function(user) {
            $('#userList').append($('<button class="btn btn-default">')
                        .text(user)
                        .on('click', function() {
                              socket.emit('invite',  user);
                        }));
        });
    };

    var addUser = function(userId) {
        usersOnline.push(userId);
        updateUserList();
    };

    var removeUser = function(userId) {
          for (var i=0; i<usersOnline.length; i++) {
            if (usersOnline[i] === userId) {
                usersOnline.splice(i, 1);
            }
         }
         
         updateUserList();
     };
    
});

