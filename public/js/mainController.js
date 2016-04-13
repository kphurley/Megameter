
angular.module('MainCtrl', []).controller('MainController', function() {

    this.tagline = 'To the moon and back!';  
    
    this.userName = '';
    
    this.showLogin = true;
    
    this.showLobby = false;
    
    this.onLogin = function(){
        
        if (this.userName.length > 0) {
            //$('#userLabel').text(username);
            socket.emit('login', this.userName);
            this.showLogin = false;
            this.showLobby = true;    
            
        }
        
    };
    
    
});

