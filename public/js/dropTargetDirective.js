// dropTargetDirective.js
var DropTarget= function () {
 
    return {
        restrict: "A",
        link: function (scope, element, attributes, ctlr) {
 
            element.bind("dragover", function(eventObject){
                eventObject.preventDefault();
            });
 
            element.bind("drop", function(eventObject) {
                 
                // invoke controller/scope move method, and pass the intended target's div id
                //scope.moveToBox(parseInt(eventObject.dataTransfer.getData("text")), eventObject.target.id);
                scope.convertToMove(parseInt(eventObject.dataTransfer.getData("text")), eventObject.target.id);
                
                //this gets the target div's id!  WAHOO!
                //console.log(eventObject.target.id);
 
                // cancel actual UI element from dropping, since the angular will recreate the UI element
                eventObject.preventDefault();
            });
        }
    };
}