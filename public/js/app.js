angular.module('megameter', ['ngRoute', 'appRoutes', 'MainCtrl', 'ModalsModule'])
//angular.module('megameter', ['ngRoute', 'appRoutes', 'MainCtrl'])
    .directive("ddDraggable", Draggable)
    .directive("ddDropTarget", DropTarget); 

//THE DIRECTIVES CAN BE ADDED HERE...THEY ARE INVOKED AS FOLLOWS...
//angular.module(params).directive(params).directive(params)....etc