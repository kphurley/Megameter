
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
    
    //the id of the div element to drop during a move
    $scope.droppedElementID = null;
    
    //the defined area (div id) receiving the dragged element
    $scope.dropAreaID = null;
    
    //called when a user puts in their username and clicks the button
    $scope.onLogin = function(){
        
        if ($scope.userName.length > 0) {
            //$('#userLabel').text(username);
            socket.emit('login', $scope.userName);
            $scope.showLogin = false;
            $scope.showLobby = true;    
            
        }
        
    };
    
    //this submits a player's choice of card to play to the server
    $scope.submitPlay = function(){
        
        //if(card !== undefined) $scope.cardIndex = card;
        //if(area !== undefined) $scope.areaIndex = area;
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
    
    //TODO - This works.  HOWEVER - it is possible that a client can tweak this to see the other person's hand!
    //TODO - MAJOR ISSUE - TURN SWITCHING COMPLETELY BROKEN
    
    socket.on('move', function(msg) {
        
        console.log('move message received');
        
        //clear the current UI version of hand and replace it with the server's
        if(msg.game.id === $scope.serverGame.id) 
        {
            if(msg.player === $scope.playerNum){
                $scope.hand = [];
                $scope.oppKm = [];
                $scope.oppSafeties = [];
                $scope.oppStatus = [];
                $scope.carStatus = [];

                //populate hand
                for(var i=0; i<msg.hand.length; i++){
                    $scope.hand.push({id: i, name: msg.hand[i], img: getCardImage(msg.hand[i])});
                }
                
                //populate opposing km cards
                for(var i=0; i<msg.board.playingArea[$scope.otherPlayerNum].km.length; i++){
                    $scope.oppKm.push({id: i, name: msg.board.playingArea[$scope.otherPlayerNum].km[i], img: getCardImage(msg.board.playingArea[$scope.otherPlayerNum].km[i])});
                }
                
                //populate opposing safety cards
                for(var i=0; i<msg.board.playingArea[$scope.otherPlayerNum].safeties.length; i++){
                    $scope.oppSafeties.push({id: i, name: msg.board.playingArea[$scope.otherPlayerNum].safeties[i], img: getCardImage(msg.board.playingArea[$scope.otherPlayerNum].safeties[i])});
                }
                
                //populate car status cards
                for(var i=0; i<msg.board.playingArea[$scope.playerNum].carStatus.length; i++){
                    $scope.carStatus.push({id: i, name: msg.board.playingArea[$scope.playerNum].carStatus[i], img: getCardImage(msg.board.playingArea[$scope.playerNum].carStatus[i])});
                }
                
                //populate opposing status cards
                for(var i=0; i<msg.board.playingArea[$scope.otherPlayerNum].carStatus.length; i++){
                    $scope.oppStatus.push({id: i, name: msg.board.playingArea[$scope.otherPlayerNum].carStatus[i], img: getCardImage(msg.board.playingArea[$scope.otherPlayerNum].carStatus[i])});
                }
                
            
                
                //msg.board.playingArea[$scope.otherPlayerNum].km
                //msg.board.playingArea[$scope.otherPlayerNum].carStatus
                //msg.board.playingArea[$scope.otherPlayerNum].safeties
                //msg.board.playingArea[$scope.otherPlayerNum].speed
            }
        }
        
        
                
        if(msg.game.id === $scope.serverGame.id) 
        {
            $scope.serverGame = msg.game;
            
            if(msg.player === $scope.playerNum){
            
                var consoleString = "My turn? " + $scope.isPlayerTurn + "\n" + "My Playing Area:" + "\n" +
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
            $scope.isPlayerTurn = ($scope.serverGame.turn === $scope.playerNum);
            
            $scope.$apply();
            
        
        }
        
        
    });
    
    //This is a validation handler when the server fires a movesuccessful message.
    //It also ends the player's turn.
    
    //TODO - could be modified to handle extra turns due to safeties...
    
    
    socket.on('movesuccessful', function(msg)
        {
            if(msg.success) {
                console.log('move registered successfully');
                $scope.isPlayerTurn = false;
                $scope.moveToBox($scope.droppedElementID, $scope.dropAreaID);
                
                
                
                //TODO - check for a win?
            }
        });

    //===========CONVERSION TO UI IN PROGRESS======================== 
    
    /**
    * Done - The hand is being rendered from the server.  Cards are draggable
    * TODO - Refactor and eliminate console-based stuff, validate client-side moves
    */
    
    socket.on('joingame', function(msg) {
        console.log("joined as game id: " + msg.game.id );   
        $scope.playerNum = msg.player;
        console.log($scope.playerNum);
        $scope.playerNum === 0 ? $scope.otherPlayerNum = 1 : $scope.otherPlayerNum = 0;
        
        
        //change to hand once other changes are made
        for(var i=0; i<msg.hand.length; i++){
            //$scope.items.push({id: i, name: msg.hand[i], img: getCardImage(msg.hand[i])});
            $scope.hand.push({id: i, name: msg.hand[i], img: getCardImage(msg.hand[i])});
        }
        
        
        
        var consoleString = "My turn? " + $scope.isPlayerTurn + "\n" + "My Playing Area:" + "\n" +
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
    
    var getCardImage = function(cardName){
        var cardNames = [200, 100, 75, 50, 25, 'GS','ST', 'RP','GO','OOG','FLT','ACC','STP','SPDL', 'ENDSL', 'RGTWAY', 'DRVACE', 'PNCPRF', 'EXTANK'];
        var index = cardNames.indexOf(cardName);
        if(index === -1) return null;
        
        var fileNames = ['200km', '100km', '75km', '50km', '25km', 'gasoline', 'spareTire', 'repairs', 'go', 'outOfGas', 'flatTire', 'accident', 'stop', 'speedLimit', 'endOfSpeedLimit', 'rightOfWay', 'drivingAce', 'punctureProof', 'extraTank'];
        
        return 'assets/mm_card_'+fileNames[index]+'.jpg';
    }
    
    //--------Experimental - drag/drop implementation-----------
     
    // arrays for dropped items
    $scope.discard = [];  //area 0 
    $scope.km = [];  //area 1
    $scope.carStatus = []; //area 2
    $scope.safeties = []; //area 3
    $scope.speed = []; //area 4
    $scope.oppCarStatus = [];  //area 5
    $scope.oppSpeed = []; //area 6
    
    // non-droppable arrays
    $scope.oppKm = [];
    $scope.oppSafeties = [];
    
    //$scope.dropped = [];
 
    // array of items for dragging (the hand)
    //$scope.items = [];
    $scope.hand = [];
    
    // convertToMove - this function handles a drop request, and converts it to a move
    // to be passed to submitPlay
    
    $scope.convertToMove = function(id, area){
        
        for (var index = 0; index < $scope.hand.length; index++) {
 
            var item = $scope.hand[index];
                 
            if (item.id == id) {
                
                $scope.cardIndex = index;
                $scope.droppedElementID = id;
                $scope.dropAreaID = area;
                
                switch(area){
                    case 'discard':
                        $scope.areaIndex = 0;
                        break;
                        
                    case 'kmBox':
                        
                        $scope.areaIndex = 1;
                        break;
                        
                    case 'carStatusBox':
                        
                        $scope.areaIndex = 2;
                        break;
                        
                    case 'safetyBox':
                        
                        $scope.areaIndex = 3;
                        break;
                        
                    case 'speedBox':
                        
                        $scope.areaIndex = 4;
                        break;
                        
                    case 'oppStatusBox':
                        
                        $scope.areaIndex = 5;
                        break;
                        
                    case 'oppSpeedBox':
                        
                        $scope.areaIndex = 6;
                        break;
                        
                    default:
                        $scope.areaIndex = -1;
                        break;
                
                }
                
                break;
            }
        }
        
        //attempt the move after the conversion
        if($scope.areaIndex !== -1) $scope.submitPlay();
        
    }
 
    $scope.moveToBox = function(id, area) {
 
        
 
            var item = $scope.hand[$scope.cardIndex];
            
                // add to correct container
                
                switch(area){
                    case 'discard':
                        $scope.discard.push(item);
                        $scope.areaIndex = 0;
                        break;
                    case 'kmBox':
                        $scope.km.push(item);
                        $scope.areaIndex = 1;
                        break;
                    case 'carStatusBox':
                        $scope.carStatus.push(item);
                        $scope.areaIndex = 2;
                        break;
                    case 'safetyBox':
                        $scope.safeties.push(item);
                        $scope.areaIndex = 3;
                        break;
                    case 'speedBox':
                        $scope.speed.push(item);
                        $scope.areaIndex = 4;
                        break;
                    case 'oppStatusBox':
                        $scope.oppCarStatus.push(item);
                        $scope.areaIndex = 5;
                        break;
                    case 'oppSpeedBox':
                        $scope.oppSpeed.push(item);
                        $scope.areaIndex = 6;
                        break;
                    default:
                        $scope.areaIndex = -1;
                        break;
                
                }
                
                
  
                       
  
        
        // remove from hand array
        if($scope.cardIndex !== -1) $scope.hand.splice($scope.cardIndex, 1);
        
        
        $scope.$apply();
    };

}); //end of controller definition



