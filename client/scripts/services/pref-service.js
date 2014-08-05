(function (angular , _) {
    "use strict";
    // this can be used to replace the rootScope nonsense
    var myApp = angular.module( 'canAppr' );

    myApp.factory('prefService', function($rootScope) {
        // retrieve from local storage
        rootScope.canAppr.prefs = JSON.parse ( window.localStorage.getItem('canAppr.prefs') ) || {};

        // which courses am I on
        // which content should be downloaded
        // which content should not be download
        // which content have I consumed - when / how often / when last?
        // final part to jigsaw is filecache, is this where i store the local filename?
        return {
        };

    });

})(angular , _);

