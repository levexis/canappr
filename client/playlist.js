/**
 * Created by paulcook on 05/02/15.
 */
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'numTen' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'numTen.services' is found in services.js
// 'numTen.controllers' is found in controllers.js
var myApp = angular.module('canAppr', ['ionic' ,'firebase'] )
    .config(function($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider
            .state('playlist', {
                url: '/playlist',
                templateUrl: 'playlist_home.html',
                controller : 'PlayCtrl'
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/playlist');

    })
    .run(
    function ($rootScope, $window, $injector ) {
        var document = $window.document;
        // provides some useful things for debugging and testing, should be removed in web app production
        $window.playlist = {
            rootScope : $rootScope,
            injector : $injector,
            getService : function ( what ) {
                return $injector.get( what );
            }
        };
    });
myApp.controller('PlayCtrl',function ($scope,$rootScope,orgService,moduleService,courseService,xmlService) {

//    alert('hello world');
    $scope.model = { orgs:{}, modules:{}, courses:{} };
    function setAttr ( what ) {
        return function(data) {
            $scope.model[what] = data;
        };
    }
    $scope.getCollections = function() {
        orgService.query({},setAttr('orgs'));
        courseService.query({},setAttr('courses'));
        moduleService.query({},setAttr('modules'));
        console.log( 'getCollections' , $scope.model );
    };
    $scope.getCollections();
});
myApp.directive('generateButton', function () {
    return {
        template : '<button class="button--big" ng-click="generatePlaylist()">GENERATE</button>',
        link : function ( $scope ) {
            var template = '<organization id="ORGID">\
                <course id="COURSEID">\
                    <module id="MODULEID">\
                        <content>\
                            <description>DESCRIPTION</description>\
                            <time>TIME</time>\
                            <size>SIZE</size>\
                            <file>\
                                <type>audio</type>\
                                <owner>OWNER</owner>\
                                <url>URL</url>\
                            </file>\
                        </content>\
                    </module>\
                </course>\
                </organization>';

            $scope.generatePlaylist = function () {
                $scope.model.out = 'b64 encoded \n' + template;
                $scope.getCollections();
            };
        },
        restrict: 'E'
    };

});

