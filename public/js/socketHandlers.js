//socketHandlers.js - 

//SOCKET.IO HANDLING ===============================

// setup my socket client
var socket = io();

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
    //initGame(msg.game);
    
    //shouldn't need these-  angular is handling showing and hiding the divs    
    //$('#page-lobby').hide();
    //$('#page-game').show();
        
});


//MENU AND SETUP (WEB ELEMENT INTERACTION STUFF)

/*
$('#login').on('click', function() {
    username = $('#username').val();
        
    if (username.length > 0) {
        $('#userLabel').text(username);
        socket.emit('login', username);
            
        $('#page-login').hide();
        $('#page-lobby').show();
        } 
      });
*/

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