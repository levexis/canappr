(function(angular , _) {
    'use strict';
    var myApp = angular.module('canAppr', ['onsen.directives' ,'mediaPlayer', 'ngTouch', 'ngAnimate', 'ngCachedResource', 'ngSanitize' ])
        .run(
         function ($rootScope, $timeout , $window, $injector, $log , registryService , fileService ,prefService ) {
            var document = $window.document;
             // if in debug mode then expose rootScope and it's injector
             // eg canAppr.getService('orgService').query().$promise.then(function (results) { console.log('results',results); } ));
             $window.canAppr = { rootScope: $rootScope,
                                injector: $injector,
                                app: myApp,
                                getService: function ( what ) {
                                    return $injector.get( what );
                                },
                                ready: false };

             // phonegap stuff - where to put?
             if ( typeof $window.cordova !== 'undefined' ) {
                 var onDeviceReady = function () {
                     $log.debug( 'CORDOVA VERSION: ' + window.device.cordova );
                     // hide phonegap splash
                     navigator.splashscreen.hide();
                     // stops app bleading into phone network status bar
                     $window.StatusBar.overlaysWebView( false );
                     registryService.setConfig( 'isNative', true );
                     fileService.init('canappr' ).then( function () {
                         registryService.isReady( true );
                     });
                     // check for new files for all subscribed courses and add to queue
                     prefService.checkFiles();
                     document.addEventListener("online", prefService.checkFiles, false);
                 };
                 document.addEventListener( 'deviceready', onDeviceReady, false );
             } else {
                 // triggers web app initialisation
                 registryService.setConfig( 'isNative', false );
                 registryService.isReady( true );
             }
             if ( $window.location.port === '9000' ) {
                 registryService.setConfig( 'isE2E', true );
                 $rootScope.canAppr.prefs.module = {};
                 $rootScope.canAppr.prefs.course = {};
             }
         });
})(angular, _); // jshint ignore:line

