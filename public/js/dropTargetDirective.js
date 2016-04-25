// dropTargetDirective.js
var DropTarget= function () {
 
    return {
        restrict: "A",
        link: function (scope, element, attributes, ctlr) {
 
            element.bind("dragover", function(eventObject){
                eventObject.preventDefault();
            });
 
            element.bind("drop", function(eventObject) {
                 
                // invoke controller/scope move method
                scope.moveToBox(parseInt(eventObject.dataTransfer.getData("text")));
                
                console.log(eventObject.dataTransfer);
 
                // cancel actual UI element from dropping, since the angular will recreate a the UI element
                eventObject.preventDefault();
            });
        }
    };
}