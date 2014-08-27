(function(angular , document, window, _) {
    'use strict';
    var myApp = angular.module('canAppr', ['onsen.directives' ,'mediaPlayer', 'ngTouch', 'ngAnimate', 'ngCachedResource', 'ngSanitize' ])
        .run(
         function ($rootScope, $timeout , $window, $injector, $log , registryService , fileService ,prefService ) {

             // if in debug mode then expose rootScope and it's injector
             // eg canAppr.getService('orgService').query().$promise.then(function (results) { console.log('results',results); } ));
             $window.canAppr = { rootScope: $rootScope,
                                injector: $injector,
                                app: myApp,
                                getService: function ( what ) {
                                    return $injector.get( what );
                                }};
             // use rootscope and directive for this?
             function hideSplash() {
                var el =  angular.element( document.getElementById('splash' )).addClass('fadeOut');
                $timeout ( function () {
                    el.addClass( 'ca-hide' );
                },1000);
             }

             // phonegap stuff - where to put?
             if ( typeof window.cordova !== 'undefined' ) {
                 var onDeviceReady = function () {
                     $log.debug( 'CORDOVA VERSION: ' + window.device.cordova );
                     // stops app bleading into phone network status bar
                     window.StatusBar.overlaysWebView( false );
                     registryService.setConfig( 'isNative', true );
                     fileService.init('canappr');
                     // check for new files for all subscribed courses and add to queue
                     prefService.checkFiles();
                     document.addEventListener("online", prefService.checkFiles, false);
                     $window.canAppr.fileService = fileService;
                     // set the navtype here or mabe in config section instead of hard coding into index.html
                     hideSplash();
                 };
                 document.addEventListener( 'deviceready', onDeviceReady, false );
             } else {
                 // triggers web app initialisation
                 registryService.setConfig( 'isNative', false );
                 hideSplash();
             }
             if ( window.location.port === '9000' ) {
                 registryService.setConfig( 'isE2E', true );
             }
         });
})(angular, document, window, _); // jshint ignore:line

