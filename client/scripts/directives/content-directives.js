(function (angular) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    myApp.directive('cdContent', function( xmlService , $window) {
        var directive = {
            restrict: 'E',
            scope: { playlist : '@',
                playObj : '@'
            },
            compile : function ( scope, element, attributes ) {
                // do one-time configuration of element.
                /*
                var linkFunction = function ( $scope, element, attributes ) {
                    console.log ( 'PlayList',attributes.playlist );
                    if (attributes.playlist && typeof $window.atob === 'function') {
                        $scope.playObj = xmlService.toObject (atob(attributes.playlist));
                    }
                };
                 */
                var _doPlaylist = function ( scope ) {
                    if ( scope.playlist && typeof $window.atob === 'function' ) {
//                        console.log ('playlist',scope.playlist);
                        var playObj = xmlService.toObject( atob( scope.playlist ) );
//                        console.log ('PROCESSED', scope , playObj );
                        scope.playObj = playObj;
                    }
                }
                var linkFunction = function ( scope, element, attributes ) {
                    _doPlaylist( scope );
//                    console.log ( 'linked' , scope,element,attributes );
                    scope.$watch( 'playlist', function ( newer, older ) {
//                        console.log ( 'changed', scope,  newer , older ,!older || newer !== older  );
                        if (!older || newer !== older) _doPlaylist( scope );
                    } );
                    /*
                    attributes.$observer ( 'playlist', function (value) {
                        console.log ( 'changed playlist',value);
                        _doPlaylist( scope );
                    });
                    */å
                };
                return linkFunction;
            },
            template: '<div>{{playObj}}</div>'
        };
        return directive;
    });
})(angular);