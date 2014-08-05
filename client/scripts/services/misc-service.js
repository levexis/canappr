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
    });
/* finds the offset of an angular element as not provided in jquery lite
eg offset(angular.element (document.querySelector( '.ca-progress')));
@param angular.element
 */
    myApp.factory('domUtils', function() {
        function offset(elm) {
            try {return elm.offset();} catch(e) {}
            var rawDom = elm[0];
            var _x = 0;
            var _y = 0;
            var body = document.documentElement || document.body;
            var scrollX = window.pageXOffset || body.scrollLeft;
            var scrollY = window.pageYOffset || body.scrollTop;
            _x = rawDom.getBoundingClientRect().left + scrollX;
            _y = rawDom.getBoundingClientRect().top + scrollY;
            return { left: _x, top:_y };
        }
        return { offset: offset }
    });
})(angular);


