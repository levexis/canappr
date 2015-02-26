(function(angular , _) {
    'use strict';
    var myApp = angular.module('canAppr', ['onsen.directives' ,'mediaPlayer', 'ngTouch', 'ngAnimate', 'ngCachedResource', 'ngSanitize' ])
        .run(
         function ($rootScope, $timeout , $window, $injector, $log , registryService , fileService ,prefService, analService, navService ) {
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
             if ( $window.location.port === '9000' ) {
                 registryService.setConfig( 'isE2E', true );
                 $rootScope.canAppr.prefs.module = {};
                 $rootScope.canAppr.prefs.course = {};
             }
             // phonegap stuff - where to put?
             if ( typeof $window.cordova !== 'undefined' ) {
                 var onDeviceReady = function () {
                     $log.debug( 'CORDOVA VERSION: ' + window.device.cordova );
                     analService.init( "UA-54805789-1" );
                     analService.trackView( "start" );
                     // stops app bleading into phone network status bar
                     $window.StatusBar.overlaysWebView( false );
                     registryService.setConfig( 'isNative', true );
                     // set back button behaviour via a backButton config function or will just go home
                     document.addEventListener("backbutton",
                         function () {
                             var goBack = registryService.getConfig( 'backButton' );
                             if ( typeof goBack === 'function' ) {
                                 goBack();
                             } else {
                                 // go home by default
                                 navService.go( 'views/home.html', {
                                     navDir : 'new'} );
                             }
                         }, false);

                     function onBackKeyDown() {
                         // Handle the back button
                     }
                     fileService.init('canappr' ).then( function () {
                         // hide phonegap splash
                         $window.navigator.splashscreen.hide();
                         registryService.isReady( true );
                         // check for new files for all subscribed courses and add to queue
                         prefService.checkFiles();
                         document.addEventListener("online", prefService.checkFiles, false);
                     });
                 };
                 document.addEventListener( 'deviceready', onDeviceReady, false );
             } else {
                 // triggers web app initialisation
                 registryService.setConfig( 'isNative', false );
                 registryService.isReady( true );
             }
         });
})(angular, _); // jshint ignore:line

