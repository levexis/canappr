(function (angular) {
    "use strict";

    var myApp = angular.module( 'canAppr' );

    myApp.factory('orgService', function($cachedResource , $rootScope) {
        return new $cachedResource('orgs',$rootScope.canAppr.apiBase + 'organizations/:id', { id:'@id' });
    });
    myApp.factory('courseService', function($cachedResource , $rootScope) {
        return new $cachedResource('courses',$rootScope.canAppr.apiBase + 'courses/:id', { id:'@id' });
    });
    myApp.factory('moduleService', function($cachedResource , $rootScope) {
        return new $cachedResource('modules',$rootScope.canAppr.apiBase + 'modules/:id', { id:'@id' });
    });
// whilst we use a local flat file API this mocks the response for us
    myApp.factory ( 'localAPIInterceptor', function( $q , $log, registryService) {
        var apiBase = registryService.getAPIBase();
        return {
            'request': function(config) {
                var route,id,match, pos = config.url.indexOf (apiBase);
                // do something on success
                if ( pos > -1 ) {
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
                var responseData;
                if ( response.config.parseId ) {
                    // remove elements from response array that do not match
                    // could also apply searches here by looking at query string
                    // currently doing that with an angular filter
                    response.data = _.where ( response.data, { id: response.config.parseId } );
                    response.resource = _.where ( response.resource, { id: response.config.parseId } );
//                    $log.debug( 'mock api', response );
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
})(angular);
