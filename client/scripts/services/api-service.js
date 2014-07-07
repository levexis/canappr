(function (angular) {
    "use strict";

    var myApp = angular.module( 'canAppr' );

    myApp.factory('orgs', ['$cachedResource', '$rootScope', function($cachedResource , $rootScope) {
        return new $cachedResource('orgs',$rootScope.cannAppr.apiBase + 'organizations/:id', { id:'@id' });
    }]);
    myApp.factory('courses', ['$cachedResource', '$rootScope', function($cachedResource , $rootScope) {
        return new $cachedResource('courses',$rootScope.cannAppr.apiBase + 'courses/:id', { id:'@id' });
    }]);
    myApp.factory('modules', ['$cachedResource', '$rootScope', function($cachedResource , $rootScope) {
        return new $cachedResource('modules',$rootScope.cannAppr.apiBase + 'modules/:id', { id:'@id' });
    }]);

})(angular);
