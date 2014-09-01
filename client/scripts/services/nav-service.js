(function (angular) {
    "use strict";
    // this can be used to replace the rootScope nonsense
    var myApp = angular.module( 'canAppr' );

    myApp.factory('navService', function($rootScope , $log, $q, qutils, registryService , orgService, courseService, moduleService) {

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
                // this is the one phone gap uses - single screen
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
                try {
                    if ( options && options.oldScope) {
                        $log.debug( 'old scope', options.oldScope);
                        options.oldScope.$remove();
                    }
                } catch (err) {
                    // something doesn't exist
                    $log.debug('scoped remove error',where,options,err);
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
                    // css selection not always available but always single page on mobile
                    return registryService.getConfig('isNative') || angular.element (document.querySelector('.secondary')).css('width') === '100%';
                } else {
                    return null;
                }
            },
            /* sets the nav state for when navigation is done directly
             * still requires navigate.go to go to the correct view
             * if switching to module then it will look up course and org if not specified
             * @param {object} {org: n, course:n, module:n }
             * @returns {promise} resolves to all promise results or false if options not set
             */
            setNavState: function ( options ) {
                var orgPromise,coursePromise,modulePromise,
                    promises = [];
                function _set(name, id, deferred) {
                    var service;
                    if ( name === 'org' ) {
                        service = orgService;
                    } else if ( name === 'course' ) {
                        service = courseService;
                    } else if ( name === 'module' ) {
                        service = moduleService;
                    } else {
                        $log.error('unknown nav',name);
                        return false;
                    }
                    service.query( {id: id} , function ( results ) {
                        $log.debug( 'debug',name,id,results[0] );
                        registryService.setNavModel(name, results[0]);
                        deferred.resolve( results[0] );
                    } ,
                    function (err) {
                        $log.error( err, name ,id  );
                        deferred.reject( err );
                    });
                }
                if ( typeof options === 'object' ) {
                    if ( options.moduleId ) {
                        modulePromise = $q.defer();
                        _set( 'module', options.moduleId , modulePromise );
                        promises.push ( modulePromise.promise );
                    }
                    // if course is set then can get in parallel, otherwise its series
                    if ( options.courseId ) {
                        coursePromise = $q.defer();
                        _set( 'course', options.courseId , coursePromise );
                    } else if ( modulePromise ) {
                        coursePromise = $q.defer();
                        modulePromise.promise.then ( function ( module ) {
                            _set( 'course', module.courseId , coursePromise );
                        } );
                    }
                    if ( coursePromise ) {
                        promises.push( coursePromise.promise );
                    }
                    if ( options.orgId ) {
                        orgPromise = $q.defer();
                        _set( 'org', options.orgId , orgPromise );
                    } else if ( coursePromise ) {
                        orgPromise = $q.defer();
                        coursePromise.promise.then ( function ( course ) {
                            _set( 'org', course.orgId , orgPromise );
                        } );
                    }
                    if ( orgPromise ) {
                        promises.push( orgPromise.promise );
                    }
                    return $q.all(promises );
                } else {
                    return qutils.resolved( false );
                }
            },
            // these are our routes on top of onsen, used by cdBody directive
            getRouteTemplate: function(urlHash) {
                if ( !urlHash || urlHash.substr(0,6) === '#/home' ) {
                    return 'views/home.html';
                } else if ( urlHash.substr(0,6) === '#/main' ) {
                    return 'views/main.html';
                } else if ( urlHash.substr(0,9) === '#/content' ) {
                    return 'views/content.html';
                } else if ( urlHash.substr(0,9) === '#/library' ) {
                    return 'views/library.html';
                } else {
                    return 'views/404.html';
                }
            }
        };
    });
})(angular); // jshint ignore:line


