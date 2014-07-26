(function (angular) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    // couldn't get 2 way bindings to work, needed to use an explicit watch
    myApp.directive('cdContent', function( xmlService , $window) {
        var directive = {
            restrict: 'E',
            compile : function ( element, attributes ) {
                // do one-time configuration of element.
                var linkFunction = function ( $scope, element, attributes ) {
                    if (attributes.playlist && typeof $window.atob === 'function') {
                        $scope.playObj = xmlService.toObject (atob(attributes.playlist));
                    }
                };
                return linkFunction;
            },
            template: '<div>{{playObj}}</div>'
        };
        return directive;
    });
})(angular);