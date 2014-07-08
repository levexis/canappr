(function (angular) {
    "use strict";
    // this can be used to replace the rootScope nonsense
    var myApp = angular.module( 'canAppr' );

    myApp.factory('registryService', function($scope) {
        return new $cachedResource('orgs',$rootScope.canAppr.apiBase + 'organizations/:id', { id:'@id' });
    });

})(angular);
