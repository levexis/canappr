(function(angular , document, window) {
    'use strict';
    var myApp = angular.module('canAppr', ['onsen.directives' ,'mediaPlayer', 'ngTouch', 'ngAnimate', 'ngCachedResource', 'ngSanitize' ])
        .run(
         function ($rootScope, $timeout , $window, $injector, $log , registryService, fileService) {

             // if in debug mode then expose rootScope and it's injector
             // eg canAppr.getService('orgService').query().$promise.then(function (results) { console.log('results',results); } ));
             $window.canAppr = { rootScope: $rootScope,
                                injector: $injector,
                                app: myApp,
                                getService: function ( what ) {
                                    return $injector.get( what );
                                }};
             // phonegap stuff - where to put?
             if ( typeof window.cordova !== 'undefined' ) {
                 var onDeviceReady = function () {
                     $log.debug( 'CORDOVA VERSION: ' + window.device.cordova );
                     // stops app bleading into phone network status bar
                     window.StatusBar.overlaysWebView( false );
                     registryService.setConfig( 'isPhonegap', true );
                     fileService.init('canappr');
                     $window.canAppr.fileService = fileService;
                     // set the navtype here or mabe in config section instead of hard coding into index.html
                 };
                 document.addEventListener( 'deviceready', onDeviceReady, false );
             }
         });

    // this is just an example
    myApp.factory ( 'myInterceptor', function( $q , $log) {
        return {
/*            // optional method
            'request': function(config) {
                // do something on success
                console.log('req',config);
                return config;
            },
            // optional method
            'requestError': function(rejection) {
                console.log('reqerr',rejection);
                return $q.reject(rejection);
            },
            // optional method
            'response': function(response) {
                console.log('res',response);
                return response;
            },
            // optional method
            */
            // mock api repsponse errors?
            'responseError': function(rejection) {
                $log.debug('http response err',rejection);
                return $q.reject(rejection);
            }
        };
    });
    myApp.config( function ( $httpProvider  ) {
        $httpProvider.interceptors.push('myInterceptor');

        // if none of the above states are matched, use this as the fallback
//        urlRouter.otherwise('/', {
//            redirectTo: '/'
//        });
    } );
})(angular, document, window); // jshint ignore:line

