(function ( angular, _ ) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    // how can we dynamically inject the resource, have hard coded organizations for now
    // need current model and then collection for list, eg collectionId 5 is model and courses is the collection etc
    myApp.controller( 'HomeCtrl',
        function ( $scope , $rootScope, registryService, prefService , navService , fileService) {
            $scope.go = function (where) {
                navService.go ( 'views/main.html' ,{ collection : where ,
                    navDir: 'forward'});
            };
        } );
})(angular,_)// jshint ignore:line
