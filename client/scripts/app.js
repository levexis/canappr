(function(angular) {
    'use strict';
    var myApp = angular.module('canAppr', ['onsen.directives' ,'mediaPlayer', 'ngTouch', 'ngAnimate', 'ngCachedResource', 'ngSanitize' ])
        .run(
         function ($rootScope, $timeout , $window, $injector, $log) {
             // app global config, there is probably a service for this
             $rootScope.canAppr = { apiBase : 'api/0/',
                 navParams : { org : {}, module : {}, course : {} } };
             // if in debug mode then expose rootScope and it's injector
             // eg canAppr.getService('orgService').query().$promise.then(function (results) { console.log('results',results); } ));
             $window.canAppr = { rootScope: $rootScope,
                                injector: $injector,
                                app: myApp,
                                getService: function ( what ) {
                                    return $injector.get( what );
                                }};
         });
    // this is just an example
    myApp.factory ( 'myInterceptor', function( $q ) {
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
//                console.log('reserr',rejection);
                return $q.reject(rejection);
            }
        };
    });
    myApp.config( function ( $httpProvider ) {
        $httpProvider.interceptors.push('myInterceptor');

        // if none of the above states are matched, use this as the fallback
//        urlRouter.otherwise('/', {
//            redirectTo: '/'
//        });
    } );
})(angular);

