// dropTargetDirective.js
var DropTarget= function () {
 
    return {
        restrict: "A",
        link: function (scope, element, attributes, ctlr) {
 
            element.bind("dragover", function(eventObject){
                eventObject.preventDefault();
            });
 
            element.bind("drop", function(eventObject) {
                
                
                var dropTarget = eventObject.target.id;
                
                //get rid of the '_temp' at the end
                dropTarget = dropTarget.substring(0, dropTarget.length-5);
                
                // invoke controller/scope move method, and pass the intended target's div id
                // the second parameter takes off the "_temp" at the end               
                scope.convertToMove(parseInt(eventObject.dataTransfer.getData("text")), dropTarget);
                
                //this gets the target div's id!  WAHOO!
                //console.log(eventObject.target.id);
                
                scope.$apply("disableDragContent()");
 
                // cancel actual UI element from dropping, since the angular will recreate the UI element
                eventObject.preventDefault();
            });
        }
    };
}