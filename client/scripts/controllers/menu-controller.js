(function (angular, _ ) {
    "use strict";

    var myApp = angular.module( 'canAppr' );
    var intances = 1;

    myApp.controller( 'MenuCtrl', function ( $scope, $location , $rootScope, $log, orgService , courseService, moduleService , registryService, navService ) {
        var _navParams = registryService.getNavModels();
        $scope.options = [ { name:'org',class: 'fa-male' , model: _navParams.org },
            { name: 'course', class: 'fa-book' , model: _navParams.course } ,
            { name: 'module', class: 'fa-terminal' , model: _navParams.module } ];

//      watch rootscope for nav update, TODO: watch the config service
        $rootScope.$watch('canAppr.navParams' , function ( after , before) {
//          console.log('navParams', after, before);
            /* resets parameters if you go back up tree */
            // note the existence checks, when direct navigation used previous values are reset so this doesn't
            // trip over itself and get into a race condition
            if ( before && after ) {
                if ( before.org.id && after.org.id && before.org.id !== after.org.id ) {
                    registryService.resetNavModel( 'course' );
                    registryService.resetNavModel( 'module' );
                } else if ( before.course.id && after.course.id && before.course.id !== after.course.id ) {
                    registryService.resetNavModel( 'module' );
                }
            }
        } , true );

        $scope.listClick = function ( item ) {
            navService.go ( 'views/main.html' ,{ collection : item.name ,
                                                navDir: 'new'});
        };
        $scope.goHome = function () {
            navService.go ( 'views/home.html' ,{
                navDir: 'new'} );
        };
    } );

})(angular , _); // jshint ignore:line

