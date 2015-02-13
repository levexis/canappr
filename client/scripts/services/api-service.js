(function (angular, _) {
    "use strict";


    var myApp = angular.module( 'canAppr' ),
        _fireRef;

/*
    myApp.value('firebase', (new Firebase('https://glowing-torch-3900.firebaseio.com/')));

    myApp.factory("orgService", function( firebaseResource ) {
        var Orgs = firebaseResource(
            {
//                path: 'organizations'
            }
        );

        return Orgs;
    });


 */
    // adds just the methods we're using here, which is a read only api request
    function _mockResource ( baseRef, collection ) {
        this.baseRef = baseRef;
        this.getData = function () {
            return baseRef.$asObject()[collection] || [];
        };
        // ignore what for now, I have a feeling this is done by the interceptor below anyway as api is actually flat files
        this.query = function ( what , callBack ) {
            var data = this.getData();
            if ( !callBack && typeof what === 'function' ) {
                callBack = what;
            } else if (  typeof what === 'function' ) {
                what = what();
            }
            if ( typeof callBack === 'function' ) {
                callBack( data );
            }
            return data;
        }
    }
    myApp.factory("orgService", function( $firebase ) {
            // should we always refresh or poll, presume this is taken care of?
            _fireRef = _fireRef || new Firebase("http://glowing-torch-3900.firebaseio.com/");
            // create an AngularFire reference to the data
            return  new _mockResource( $firebase(_fireRef) , 'organizations' );
        });
    myApp.factory("courseService", function( $firebase ) {
        // should we always refresh or poll, presume this is taken care of?
        _fireRef = _fireRef || new Firebase("http://glowing-torch-3900.firebaseio.com/");
        // create an AngularFire reference to the data
        return  new _mockResource( $firebase(_fireRef) , 'courses' );
    });
    myApp.factory("moduleService", function( $firebase ) {
        // should we always refresh or poll, presume this is taken care of?
        _fireRef = _fireRef || new Firebase("http://glowing-torch-3900.firebaseio.com/");
        // create an AngularFire reference to the data
        return  new _mockResource( $firebase(_fireRef) , 'modules' );
    });
/*
    myApp.factory('orgService', function($cachedResource , $rootScope) {
        return new $cachedResource('orgs',$rootScope.canAppr.apiBase + 'organizations/:id', { id:'@id' });
    });
    myApp.factory('courseService', function($cachedResource , $rootScope) {
        return new $cachedResource('courses',$rootScope.canAppr.apiBase + 'courses/:id', { id:'@id' });
    });
    myApp.factory('moduleService', function($cachedResource , $rootScope) {
        return new $cachedResource('modules',$rootScope.canAppr.apiBase + 'modules/:id', { id:'@id' });
    });
 */
// whilst we use a local flat file API this mocks the response for us
    myApp.factory ( 'localAPIInterceptor', function( $q , $log, registryService) {
        var apiBase = registryService.getAPIBase();
        function isLocalAPIRequest(url) {
            // only looks to see if its an API request for now - todo add check its same host or no host for native
            return !!( url && url.indexOf( apiBase ) > -1);
        }
        return {
            'request': function(config) {
                var route,id,match, pos;
                // do something on success
                if ( isLocalAPIRequest(config.url) ) {
                    pos = config.url.indexOf (apiBase);
                    // whilst mocking the url we create the individual ids from
                    match = /(.*?)\/(.*)/.exec( config.url.substr( pos + apiBase.length ) );
                    if (match) {
                        route = match[1];
                        id = match[2];
                        config.url = apiBase + route;
                        config.parseId = id;
                        $log.debug('mock api', route, id);
                    }
                }
                return config;
            },
            /* optional method
             'requestError': function(rejection) {
             console.log('reqerr',rejection);
             return $q.reject(rejection);
             },*/
            // optional method
            'response': function(response) {
                var responseData, query;
                // apply query string for local API
                if ( isLocalAPIRequest ( response.config.url ) ) {
                    query = response.config.params;
                    if ( response.config.parseId ) {
                        query = query || {};
                        query.id = response.config.parseId;
                    }
                    // remove elements from response array that do not match as local api is just a flat file
                    if ( query ) {
                        response.data = _.where( response.data, query );
                        response.resource = _.where( response.resource, query );
                    }
                }
                return response;
            },
            // mock api repsponse errors?
            'responseError': function(rejection) {
                $log.debug('http response err',rejection);
                return $q.reject(rejection);
            }
        };
    });
    myApp.config( function ( $httpProvider  ) {
        $httpProvider.interceptors.push('localAPIInterceptor');
    } );
})(angular , _); // jshint ignore:line
