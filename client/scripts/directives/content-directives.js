(function (angular) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    // couldn't get 2 way bindings to work, needed to use an explicit watch
    myApp.directive('cdContent', function( xmlService ) {
        var directive = {
            restrict: 'E',
            compile : function ( element, attributes ) {
                // do one-time configuration of element.
                var linkFunction = function ( $scope, element, attributes ) {
                    console.log('cdContent' , $scope, element, attributes);
                    if (attributes.playlist) {
                        // atob not compatible with IE
                        console.log('playlist', xmlService.toObject (atob(attributes.playlist)) );
                    }
                };
                return linkFunction;
            }
        };
        return directive;
    });
})(angular);