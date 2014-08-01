(function (angular, _ ) {
    "use strict";

    var myApp = angular.module( 'canAppr' );
    var intances = 1;

    myApp.controller( 'MenuCtrl', function ( $scope, $location , $rootScope, $timeout, orgService , courseService, moduleService , registryService, navService ) {
        var _navParams = registryService.getNavModels();
        $scope.options = [ { name:'org',class: 'fa-male' , model: _navParams.org },
            { name: 'course', class: 'fa-book' , model: _navParams.course } ,
            { name: 'module', class: 'fa-terminal' , model: _navParams.module } ];

//      watch rootscope for nav update, TODO: watch the config service
        $rootScope.$watch('canAppr.navParams' , function ( after , before) {
//          console.log('navParams', after, before);
            /* resets parameters if you go back up tree */
            if ( before && after ) {
                if ( before.org.id != after.org.id ) {
                    console.log( 'blank course / module', after, before );
                    registryService.resetNavModel( 'course' );
                    registryService.resetNavModel( 'module' );
                } else if ( before.course.id != after.course.id ) {
                    registryService.resetNavModel( 'module' );
                } else {
                }
            }
        } , true );

        $scope.listClick = function ( item ) {
            navService.go ( 'views/main.html' ,{ collection : item.name});
        }
    } );

})(angular , _);

