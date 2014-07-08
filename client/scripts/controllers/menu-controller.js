(function (angular, _ ) {
    "use strict";

    var myApp = angular.module( 'canAppr' );


    myApp.controller( 'MenuCtrl', function ( $scope, $location , $rootScope, orgs , courses, modules ) {
        $scope.options = [ { name:'org', label: '', class: 'fa-male', model: {name: 'Organizations'} } ,
            { name: 'course', label: '', class: 'fa-book' } ,
            { name: 'module', label: '', class: 'fa-terminal' } ];

//      watch rootscope for nav update, should this be a config service - YES it should!
        $rootScope.$watch('canAppr.navParams' , function ( after , before) {
            var navParams = $rootScope.canAppr.navParams;
            // should be a service? Returns true if changed
            function _getLabel (key , api ) {
                var option = _.findWhere( $scope.options ,{ name: key} );
                if ( !api ) {
                    // call to reset
                    option.model={};
                } else if ( !before || !before[key] ||  before[key].id !== navParams[key].id ) {
                    api.get( { id : navParams[key].id} ).$promise
                        .then( function ( result ) {
                            navParams[key] = result;
                            option.model = result;
                        } );
                    return true;
                }
                return false;
            }
            /* resets parameters if you go back up tree */
            if ( navParams.org.id  && _getLabel ( 'org',orgs ) ) {
                navParams.course = {};
                _getLabel ( 'course');
                navParams.module = {};
                _getLabel ( 'module');
            } else if ( navParams.course.id && _getLabel ( 'course',courses ) ) {
                navParams.module = {};
                _getLabel ( 'module');
            } else if ( navParams.module.id ) {
                _getLabel( 'module', modules );
            }
        } , true );

        $scope.listClick = function ( item ) {
            var where;
            if ( item.name === 'org' ) {
                where = 'organizations';
            } else {
                where = item.name + 's';
            }
            $scope.$state.go ( where , { id : item.id } );
        }
    } );
})(angular , _);
