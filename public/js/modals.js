//Thank you Ben Nadel for an amazing implementation of Modals in Angular!
//His post here:  http://www.bennadel.com/blog/2806-creating-a-simple-modal-system-in-angularjs.htm

var modalsModule = angular.module('ModalsModule', ["ngAnimate"]);

//indivdual controllers for each modal type

modalsModule.controller('AlertModalController', function($scope, modals) {
    
    //Setup default values using modal params
    $scope.message = (modals.params().message || 'Whoa!');
    $scope.userName = modals.params().userName;
    $scope.userScore = modals.params().userScore;
    $scope.opponentName = modals.params().opponentName;
    $scope.opponentScore = modals.params().opponentScore;
    
    //Wire the modal buttons into modal resolution actions
    $scope.close = modals.resolve;
    
    
});


//A service to manage modals
modalsModule.service('modals', function($rootScope, $q) {
    
    //This represents the currently active modal window instance
    var modal = {
        deferred: null,
        params : null
    };
    
    //Return the public API
    return({
        open: open,
        params: params,
        proceedTo: proceedTo,
        reject: reject,
        resolve: resolve
    });
    
    //Methods
    
    /*
        Open a modal of the given type, with the given params
        If a window is already open, you can optionally pipe the response of the 
        new modal window into the response of the current modal window.  Otherwise,
        the current modal will be rejected before the new modal window is opened.
    */
    function open(type, params, pipeResponse){
        
        var previousDeferred = modal.deferred;
        
        //Set up the new modal instance
        modal.deferred = $q.defer();
        modal.params = params;
        
        //Pipe the new window response into the previous window's deferred value
        if(previousDeferred && pipeResponse){
            
            modal.deferred.promise
                .then(previousDeferred.resolve, previousDeferred.reject);
        
        //Not going to pipe, immediately reject the current window
        } else if (previousDeferred) {
            
            previousDeferred.reject();
        }
        
        //Tell the modals directive to open the modal of the given type
        $rootScope.$emit('modals.open', type);
        
        return (modal.deferred.promise);
    }
    
    //Return the params associated with this modal or an empty object if there are none
    function params() {
        
        return (modal.params || {});
    }
    
    //Convenience method for .open that enables the pipeResponse flag
    function proceedTo(type, params) {
        
        return (open(type, params, true));
    }
    
    //Reject the current modal with the given reason
    function reject(reason){
        
        if(!modal.deferred) return;
        
        modal.deferred.reject(reason);
        
        modal.deferred = modal.params = null;
        
        //Tell the modal directive to close the active modal window
        $rootScope.$emit('modals.close');
    }
    
    function resolve(response){
        
        if(!modal.deferred) return;
        
        modal.deferred.resolve(response);
        
        modal.deferred = modal.params = null;
        
        //Tell the modal directive to close the active modal window
        $rootScope.$emit('modals.close');
    }
    
});
    

// A directive to manage the views required to render the modals 
modalsModule.directive('bnModals', function($rootScope, modals) {
    
    //Return the directive config
    return (link);
    
    function link(scope, element, attributes) {
        
        //Defines which modal window is being rendered
        scope.subview = null;
        
        /* Not sure I want this...
        
        // If the user clicks directly on the backdrop (ie, the modals
        // container), consider that an escape out of the modal, and reject
        // it implicitly.
        element.on(
            "click",
            function handleClickEvent( event ) {
                if ( element[ 0 ] !== event.target ) {
                    return;
                }
                scope.$apply( modals.reject );
            }
        );
        
        */
        
        //Listen for 'open' events emitted by the modals service object
        $rootScope.$on(
            'modals.open', 
            function handleModalOpenEvent(event, modalType) {
                scope.subview = modalType;
            }
        );
        
        //Listen for 'close' events emitted by the modals service object
        $rootScope.$on(
            'modals.close', 
            function handleModalCloseEvent(event) {
                scope.subview = null;
            }
        );
    }
    
});

