(function(angular) {
    'use strict';
    var myApp = angular.module('canAppr', ['ui.router', 'angularCordovaWrapper', 'onsen.directives' , 'ngTouch', 'ngAnimate', 'ngCachedResource' ])
        .run(
         function ($rootScope,   $state,   $stateParams , $timeout , $window, $injector, $log) {
             // share current state globally
             $rootScope.$state = $state;
             $rootScope.$stateParams = $stateParams;
             // app global config, there is probably a service for this
             $rootScope.canAppr = { apiBase : 'api/0/',
                 navParams : { org : {}, module : {}, course : {} } };
             $rootScope.$on( '$stateChangeError', function ( event, toState, toParams, fromState, fromParams, error ) {
                 event.preventDefault();
                 $log.error( 'state change error', event, toState, toParams, fromState, fromParams );
//                 return $state.go( 'error' );
             } );
             // if in debug mode then expose rootScope and it's injector
             // eg canAppr.getService('orgService').query().$promise.then(function (results) { console.log('results',results); } ));
             $window.canAppr = { rootScope: $rootScope,
                                injector: $injector,
                                app: myApp,
                                getService: function ( what ) {
                                    return $injector.get( what );
                                }};

             /* connects ui-router and ons-navigator */
             $rootScope.$on( '$stateChangeSuccess', function ( event, toState, toParams, fromState, fromParams ) {
                 $log.debug('root change',toState.name, event, toState, toParams, fromState, fromParams ,$rootScope);
                 if ( fromState.templateUrl !== toState.templateUrl ) {
                     switch ( toParams.action ) {
                         case 'push':
                             $rootScope.ons.navigator.pushPage( app.state.current.templateUrl );
                             break;
                         default:
                             if ( $rootScope.ons.splitView ) {
                                 $rootScope.ons.splitView.setMainPage( toState.templateUrl );
                             }
                     }
                 }
                 $timeout( function () {
                     if ( $rootScope.ons.splitView && typeof $rootScope.ons.splitView.close === 'function' ) {
                         $rootScope.ons.splitView.close();
                     }
                 }, 100 );
             } );
         });
    myApp.factory ( 'myInterceptor', function( $q ) {
        return {
            // optional method
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
            'responseError': function(rejection) {
                console.log('reserr',rejection);
                return $q.reject(rejection);
            }
        };
    });
    myApp.config( [ '$stateProvider', '$urlRouterProvider' , '$httpProvider', function (stateRouter , urlRouter, $httpProvider) {
        // For any unmatched url, redirect to /state1
        urlRouter.otherwise("/");
        //
        // Now set up the states
        stateRouter
            .state('home', {
                url: "/",
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                options: {
                    canSwipe: true,
                    list: 'orgs'
                }
            })
            .state('organizations', {
                url: "/organizations",
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                options: {
                    canSwipe: true,
                    list: 'orgs',
                    reset: true
                }
            })
            .state('courses', {
                url: "/organizations/:id",
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                options: {
                    canSwipe: true,
                    list: 'courses',
                    key: 'org'
                }
            })
            .state('modules', {
                url: "/courses/:id",
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                options: {
                    canSwipe: true,
                    list: 'modules',
                    key: 'course'
                }
            })
            .state('content', {
                url: "/modules/:id",
                templateUrl: 'views/content.html',
                controller: 'ContentCtrl',
                options: {
                    canSwipe: true,
                    key: 'module'
                }
            });
//            $httpProvider.interceptors.push('myInterceptor');

        // if none of the above states are matched, use this as the fallback
//        urlRouter.otherwise('/', {
//            redirectTo: '/'
//        });
    }] );
})(angular);

