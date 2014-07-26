(function (angular) {
    "use strict";

    var myApp = angular.module( 'canAppr' );

    myApp.factory('orgService', function($cachedResource , $rootScope) {
        return new $cachedResource('orgs',$rootScope.canAppr.apiBase + 'organizations/:id', { id:'@id' });
    });
    myApp.factory('courseService', function($cachedResource , $rootScope) {
        return new $cachedResource('courses',$rootScope.canAppr.apiBase + 'courses/:id', { id:'@id' });
    });
    myApp.factory('moduleService', function($cachedResource , $rootScope) {
        return new $cachedResource('modules',$rootScope.canAppr.apiBase + 'modules/:id', { id:'@id' });
    });

})(angular);
