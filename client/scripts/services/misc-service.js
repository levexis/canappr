(function (angular) {
    "use strict";
    // this can be used to replace the rootScope nonsense
    var myApp = angular.module( 'canAppr' );

    myApp.factory('navService', function($rootScope , registryService) {

        var _config = registryService.getConfig();

        if ( typeof $rootScope.ons.slidingMenu !== 'undefined' ) {
            _config.navType = 'slide';
        } else {
            _config.navType = 'split';
        }

        return { getNavType : function () {
            return _config.navType;
            },
            /* loads the main page */
            go: function ( where, options ) {
                // add a timestamp
                where += '#' + new Date().getTime()
                if (_config.navType === 'slide' ) {
                    // force a refresh
                    _config.navOptions = options;
//                    $scope.ons.navigator.resetToPage( 'views/main.html#' + new Date().getTime() ,{ collection : item.name} );
                    $rootScope.ons.slidingMenu.setAbovePage( where);
                } else if (_config.navType === 'split' ) {
                    _config.navOptions = options;
                    // add animation class when set main page?
                    $rootScope.ons.splitView.setMainPage( where );
                }
            },
            getRouteOptions: function ($scope  ) {
                var options;
                if ( _config.navOptions ) {
                    options = _config.navOptions;
                    delete _config.navOptions;
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

    })

})(angular);


