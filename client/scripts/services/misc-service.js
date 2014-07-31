(function (angular) {
    "use strict";
    // this can be used to replace the rootScope nonsense
    var myApp = angular.module( 'canAppr' );

    myApp.factory('utilService', function() {
        return {
            /* gets the routing options from onsenUI */
            getRouteOptions: function ($scope) {
                var options;
                if ( $scope.ons.splitView && $scope.ons.splitView.options) {
                    options = $scope.ons.splitView.options;
                    delete $scope.ons.splitView.options;
                } else {
                    try {
                        options = $scope.ons.navigator.getCurrentPage().options;
                    } catch ( err ) {
                        // ignore the error, navigator not ready
                    }
                }
                return options;
            }
        };
    });

})(angular);
