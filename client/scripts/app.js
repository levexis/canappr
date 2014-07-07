(function(angular) {
    'use strict';
    var myApp = angular.module('canAppr', ['ui.router', 'angularCordovaWrapper', 'onsen.directives' , 'ngTouch', 'ngAnimate', 'ngCachedResource' ])
        .run(
        [ '$rootScope', '$state', '$stateParams',
            function ($rootScope,   $state,   $stateParams) {
                // share current state globally
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
                // app global config, there is probably a service for this
                $rootScope.cannAppr = { apiBase: 'api/0/',
                                        navParams: {} };
                $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                    event.preventDefault();
                    console.log ('state change error',event, toState, toParams, fromState, fromParams);
                    return $state.go('error');
                });

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
                    list: 'orgs'
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
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                options: {
                    canSwipe: true,
                    list: 'content',
                    key: 'module'
                }
            });
        // if none of the above states are matched, use this as the fallback
//        urlRouter.otherwise('/', {
//            redirectTo: '/'
//        });
    }] );
})(angular);

