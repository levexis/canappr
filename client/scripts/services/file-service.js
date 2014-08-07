(function (angular) {
    "use strict";
    // this can be used to replace the rootScope nonsense
    var myApp = angular.module( 'canAppr' );

    myApp.factory('fileService', function($rootScope ) {
        // retrieve from local storage
        var _files;
        $rootScope.canAppr.files = JSON.parse ( window.localStorage.getItem('files') ) || {};
        _files = $rootScope.canAppr.files;
        return {
            getFileUrl : function (url) {
                return _files[url] || url;
            }
        };

    });

})(angular);

