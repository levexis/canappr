(function(angular) {
    'use strict';
    var myApp = angular.module('canAppr', ['ui.router', 'angularCordovaWrapper', 'onsen.directives' , 'ngTouch', 'ngAnimate', 'ngCachedResource' ])
        .run(
        [        '$rootScope', '$state', '$stateParams',
            function ($rootScope,   $state,   $stateParams) {
                // share current state globally
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
            }]);
    myApp.config( [ '$stateProvider', '$urlRouterProvider' , function (stateRouter , urlRouter) {
        // For any unmatched url, redirect to /state1
        urlRouter.otherwise("/");
        //
        // Now set up the states
        stateRouter
            .state('home', {
                url: "/",
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
/*          )
            .state('orgs', {
                url : "/organizations",
                templateUrl : 'views/organizations.html',
                controller : 'OrgsCtrl'
 */          });
    }]);
    myApp.controller('TestCtrl', function( $scope , $location) {
        console.log( 'TestCtrl initialised' );
        $scope.isActive = function(route) {
            return route === $location.path();
        };
        $scope.isTester = true;
    })
})(angular);

