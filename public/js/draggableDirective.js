//draggableDirective.js 

//Defines a directive for draggable objects
var Draggable = function () {
 
    return {
        restrict: "A",
        link: function(scope, element, attributes, ctlr) {
            element.attr("draggable", true);
 
            element.bind("dragstart", function(eventObject) {
                //var dt = eventObject.dataTransfer;
                //dt.mozSetDataAt("image/png", stream, 0);
                //dt.mozSetDataAt("application/x-moz-file", file, 0);
                //dt.setData("text/uri-list", "last-race.jpg");
                //dt.setData("text/plain", imageurl);
                eventObject.dataTransfer.setData("text", attributes.itemid);
                console.log(eventObject.dataTransfer);
            });
        }
    };
}