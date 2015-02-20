/**
 * Created by paulcook on 05/02/15.
 */
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'numTen' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'numTen.services' is found in services.js
// 'numTen.controllers' is found in controllers.js
var myApp = angular.module('canAppr', ['ionic' ,'firebase','daddyswork'] )
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
//        console.log( 'getCollections' , $scope.model );
    };
    // if blank flag prevents description being over written if auto update, ie if you type the file details in first
    $scope.copyData = function(ifBlank) {
        var playlist;
        // if playlist exists for module then decodes it, if not just copies over the description of the module
        if ( $scope.model.courseId && ( !ifBlank || !$scope.model.description ) ) {
            var module = _.findWhere( $scope.model.modules , {id: $scope.model.moduleId});
            if ( module.playlist ) {
                playlist = xmlService.toObject( atob( module.playlist ));
                playlist = playlist.organization.course.module.content;
                $scope.model.description = playlist.description;
                $scope.model.time = playlist.time * 1;
                $scope.model.size = playlist.size * 1;
                $scope.model.owner = playlist.owner;
                $scope.model.url = decodeURIComponent ( playlist.file.url );
            } else {
                $scope.model.description = module.name;
            }
        }
    };

    $scope.getCollections();
});
myApp.directive('generateButton', function ( xmlService, $log ) {
    return {
        template : '<button class="button--big" ng-click="generatePlaylist()">GENERATE</button>',
        link : function ( $scope ) {
            /*jshint multistr: true */
            var template = '<organization id="ORGID">\
                <course id="COURSEID">\
                    <module id="MODULEID">\
                        <content>\
                            <description>DESCRIPTION</description>\
                            <time>TIME</time>\
                            <size>SIZE</size>\
                            <owner>OWNER</owner>\
                            <file>\
                                <type>audio</type>\
                                <url>URL</url>\
                            </file>\
                        </content>\
                    </module>\
                </course>\
                </organization>';

            $scope.generatePlaylist = function () {
                var playlist = template;
                playlist = playlist.replace(/ORGID/g , $scope.model.orgId);
                playlist = playlist.replace(/COURSEID/g , $scope.model.courseId);
                playlist = playlist.replace(/MODULEID/g , $scope.model.moduleId);
                playlist = playlist.replace(/DESCRIPTION/g , $scope.model.description);
                playlist = playlist.replace(/TIME/g , $scope.model.time);
                playlist = playlist.replace(/SIZE/g , $scope.model.size);
                playlist = playlist.replace(/OWNER/g , $scope.model.owner);
                playlist = playlist.replace(/URL/g , encodeURIComponent ($scope.model.url) );
                $log.debug ('encoding playlist', playlist);
                $scope.model.out = btoa( playlist );
            };
        },
        restrict: 'E'
    };

});

