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
                where += '#' + new Date().getTime();
                if (_config.navType === 'slide' ) {
                    // force a refresh
                    _config.navOptions = options;
//                    $scope.ons.navigator.resetToPage( 'views/main.html#' + new Date().getTime() ,{ collection : item.name} );
                    $rootScope.ons.slidingMenu.setAbovePage( where);
                } else if (_config.navType === 'split' ) {
                    _config.navOptions = options;
                    // add animation class when set main page?
                    $rootScope.ons.splitView.setMainPage( where );
                    // if the direction is new then toggle the menu
                    if ( options && options.navDir && options.navDir === 'new' ) {
                        $rootScope.ons.splitView.toggle();
                    }
                }
            },
            getRouteOptions: function ($scope ) {
                var options;
                if ( _config.navOptions ) {
                    options = _config.navOptions;
                    delete _config.navOptions;
                } else {
                    try {
                        options = $scope.ons.navigator.getCurrentPage().options;
                    } catch ( err ) {
                        // ignore the error, navigator not ready or not in compatible mode
                    }
                }
                return options;
            },
            setRouteOptions: function ( options ) {
                if (options) {
                    _config.navOptions = options;
                }
            },
            /*
             translates names to collections
             @returns string
             */
            getCollection: function ( collectionName ) {
                switch (collectionName ) {

                    case 'Organizations':
                        return 'org';
                    case 'Courses':
                        return 'course';
                    case 'Modules':
                        return 'module';
                    default :
                        return '';
                }
            },
            toggleMenu: function ( options) {
                if ( _config.navType === 'slide' ) {
                    // force a refresh
                    _config.navOptions = options;
                    $rootScope.ons.slidingMenu.toggle();
                } else if ( _config.navType === 'split' ) {
                    _config.navOptions = options;
                    // add animation class when set main page?
                    $rootScope.ons.splitView.toggle();
                }
            },
            // returns true if splitview is collapsed
            isSingle: function () {
                if ( _config.navType === 'split' ) {
                    return angular.element (document.querySelector('.secondary')).css('width') === '100%';
                } else {
                    return null;
                }
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
        return { offset: offset };
    });
/*
  formats seconds into HH:MM:SS, omits hours if not relevant
  @param seconds
 */
    myApp.factory('timeUtils', function() {

        return {secShow : function ( totalSec ) {

                var hours = parseInt( totalSec / 3600 ) % 24,
                    minutes = parseInt( totalSec / 60 ) % 60,
                    seconds = parseInt (totalSec) % 60,
                    result = (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
                if ( typeof totalSec !== 'number' ) {
                    return '';
                } else {
                    // include hours if its a long one
                    if ( hours ) {
                        result = (hours < 10 ? "0" + hours : hours) + ":" + result;
                    }
                    return result;
                }
            }
        };
    });

    myApp.factory('qutils', function ($log,$q) {

        return {
            resolved : function ( what ) {
                var resolved = $q.defer();
                resolved.resolve( what );
                return resolved.promise;
            },

            promiseSuccess : function ( deferred, message ) {
                return function ( success ) {
                    if ( message ) {
                        $log.debug( message, success );
                    }
                    deferred.resolve( success );
                };
            },

            promiseError : function ( deferred, message ) {
                return function ( error ) {
                    if ( message ) {
                        $log.debug( message, error );
                    }
                    deferred.reject( error );
                };
            }
        };
    });

})(angular); // jshint ignore:line


