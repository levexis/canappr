(function (angular , _) {
    "use strict";
    // this can be used to replace the rootScope nonsense
    var myApp = angular.module( 'canAppr' );

    myApp.factory('registryService', function($rootScope) {
        var _navParams, _config;

        if ( !$rootScope.canAppr) {
            // initialize if not already
            // app global config, there is probably a service for this
            $rootScope.canAppr = { apiBase : 'api/0/',
                navParams : { org : { name : 'Organizations' }, module : {}, course : {} },
                config : { isNative : ( typeof window.cordova !== 'undefined' ) }
            };
        }
        _navParams =  $rootScope.canAppr.navParams;
        _config = $rootScope.canAppr.config;

        // this gets the model for the selected Id
        /*
        $rootScope.$watch('canAppr.navParams' , function ( before , after ) {
            // should be a service? Returns true if changed
            function _getLabel (key , api ) {
                var option = _.findWhere( $scope.options ,{ name: key} );
                if ( !api ) {
                    // call to reset
                    option.model={};
                } else if ( !before || !before[key] ||  before[key].id !== navParams[key].id ) {
                    api.get( { id : navParams[key].id} ).$promise
                        .then( function ( result ) {
                            // append on the results
                            _.extend(navParams[key] , result );
                            option.model = result;
                        } );
                    return true;
                }
                return false;
            }
        } , true );
*/
        return {
            getNavModels: function( type ) {
                if (type) {
                    return _navParams[type];
                } else {
                    return _navParams;
                }
            },
            resetNavModel: function( type ) {
                if (type) {
                    // delete all properties
                    _.keys ( _navParams[type] ).forEach ( function (key) {
                        delete _navParams[type][key];
                    });
                }
                return _navParams[type];
            },
            setNavModel: function( type , properties ) {
                if (type && properties) {
                    // delete existing then extend new
                    this.resetNavModel(type);
                    _.extend ( _navParams[type]  , properties );
                }
                return _navParams[type];
            },
            setNavId: function( type , id ) {
                if (type && id) {
                    // delete existing then extend new
                    this.resetNavModel(type);
                    _navParams.id=id;
                }
                return _navParams[type];
            },
            getConfig: function (name) {
                if ( name ) {
                    return _config[name] || false;
                } else {
                    return _config;
                }
            },
            setConfig: function ( name , value ) {
                if ( name ) {
                    _config[name] = value;
                    return _config;
                }
            },
            // returns a string of org-course-module ( NOT NECESSARY AS WE WILL USE UNIQUE IDS FOR EACH SO JUST NEED MODULE ID!)
            getModuleId: function () {
                if (_navParams.org.id && _navParams.course.id && _navParams.module.id ) {
                    return this.getCourseId() + '-' + _navParams.module.id;
                } else {
                    return null;
                }
            },
            // returns a string of org-course ( NOT NECESSARY AS WE WILL USE UNIQUE IDS FOR EACH SO JUST NEED COURSE ID!)
            getCourseId: function () {
                if (_navParams.org.id &&  _navParams.course.id) {
                    return _navParams.org.id + '-' + _navParams.course.id;
                } else {
                    return null;
                }
            }
        };
    });

})(angular , _);// jshint ignore:line

