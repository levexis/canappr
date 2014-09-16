(function (angular) {
    "use strict";
    // this can be used to replace the rootScope nonsense
    var myApp = angular.module( 'canAppr' );

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
            /*
             * returns a resolved promise
             * note that angular does not resolve promise until digest runs
             * so you will need to do rootScope.apply in tests
             */
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
    /*
     * analytics, just basic ga for now.
     */
    myApp.factory('analService', function ($log, registryService) {
        var successCB = function() {},
            errorCB = function(err) { $log.debug('ga-error',err);},
            _gaPlugin;
        function getPlugin () {
            if ( !_gaPlugin ) {
                _gaPlugin = registryService.getConfig( 'gaPlugin' );
            }
            return _gaPlugin;
        }
        return  {
            trackView: function ( url ) {
                if ( url && getPlugin() ) {
                    $log.debug ( 'trackView', url);
                    return _gaPlugin.trackPage( successCB, errorCB, url );
                }
            },
            trackEvent: function ( category, action, label , value) {
                /* TrackEvent api
                1)  resultHandler - a function that will be called on success
                2)  errorHandler - a function that will be called on error.
                3)  category - This is the type of event you are sending such as "Button", "Menu", etc.
                4)  eventAction - This is the type of event you are sending such as "Click", "Select". etc.
                5)  eventLabel - A label that describes the event such as Button title or Menu Item name.
                6)  eventValue - An application defined integer value that can mean whatever you want it to mean.
                */
                if ( category && action && (label || value ) && getPlugin() ) {
                    $log.debug ( 'trackEvent', category, action, label , value);
                    return _gaPlugin.trackEvent( successCB, errorCB, category, action, label, value );
                }
            }
        };
    });

})(angular); // jshint ignore:line


