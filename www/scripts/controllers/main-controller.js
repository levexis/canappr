(function (angular) {
    "use strict";

    var myApp = angular.module( 'canAppr' );

    myApp.controller( 'MainCtrl', [ '$scope', '$location', function ( $scope, $location ) {
        console.log( 'Main initialised', $scope, $location );
    } ] );
})(angular);
