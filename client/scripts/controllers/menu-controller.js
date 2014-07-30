(function (angular, _ ) {
    "use strict";

    var myApp = angular.module( 'canAppr' );
    var intances = 1;

    myApp.controller( 'MenuCtrl', function ( $scope, $location , $rootScope, $timeout, orgService , courseService, moduleService ) {
        console.log ( 'menu instance',intances++);
        $scope.options = [ { name:'org', label: '', class: 'fa-male', model: {name: 'Organizations'} } ,
            { name: 'course', label: '', class: 'fa-book' } ,
            { name: 'module', label: '', class: 'fa-terminal' } ];

//      watch rootscope for nav update, should this be a config service - YES it should!
        $rootScope.$watch('canAppr.navParams' , function ( after , before) {
            console.log('navParams', after, before,$scope.options);
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
                            // append on the results
                            _.extend(navParams[key] , result );
                            option.model = result;
                        } );
                    return true;
                }
                return false;
            }
            /* resets parameters if you go back up tree */
            if ( navParams.org.id  && _getLabel ( 'org',orgService ) ) {
                console.log ('blank course / module' , after , before);
                navParams.course = {};
                _getLabel ( 'course');
                navParams.module = {};
                _getLabel ( 'module');
            } else if ( navParams.course.id && _getLabel ( 'course',courseService ) ) {
                console.log ('blank course');
                navParams.module = {};
                _getLabel ( 'module');
            } else if ( navParams.module.id ) {
                _getLabel( 'module', moduleService );
            }
        } , true );

        $scope.listClick = function ( item ) {
//          $scope.$state.go ( where , { /* id : item.model.id */ }, { reload: true } );
            $scope.ons.splitView.options = { collection : item.name};
// add animation class when set main page?
            $scope.ons.splitView.setMainPage( 'views/main.html' );
        }
    } );
})(angular , _);
