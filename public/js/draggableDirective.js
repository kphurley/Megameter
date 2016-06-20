//draggableDirective.js 

//Defines a directive for draggable objects
var Draggable = function () {
 
    return {
        restrict: "A",
        scope: false,
        link: function(scope, element, attributes, ctlr) {
            
            element.attr("draggable", true);
 
            element.bind("dragstart", function(eventObject) {
                
                eventObject.dataTransfer.setData("text", attributes.itemid);
                console.log(eventObject.dataTransfer);
                scope.$apply("enableDragContent()");
            });
            
            element.bind("dragend", function(eventObject) {
                
                scope.$apply("disableDragContent()");
            });
        }
    };
}