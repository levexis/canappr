(function ( angular, _ ) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    // how can we dynamically inject the resource, have hard coded organizations for now
    // need current model and then collection for list, eg collectionId 5 is model and courses is the collection etc
    myApp.controller( 'HomeCtrl',
        function ( $scope , prefService , navService, registryService ) {
            $scope.go = function (where) {
                navService.go ( 'views/main.html' ,{ collection : where ,
                    navDir: 'forward'});
            };
            $scope.courses = prefService.getCourses();
            // could autoplay?
            $scope.navModule = function ( module ,course ) {
                // reset the current nav state or else the watch on navParams can interfere
                registryService.setNavId('org',course.orgId );
                registryService.setNavId('course',course.id);
                registryService.setNavId('module',module.id);
                navService.setNavState ( { moduleId : module.id , courseId : course.id , orgId: course.orgId } )
                    .then ( function () {
                    navService.go( 'views/content.html',
                        { direction : 'forward',
                            autoplay : true } );
                });
            };
            $scope.navCourse =  function ( course ) {
                registryService.setNavId('org',course.orgId );
                registryService.setNavId('course',course.id);
                registryService.resetNavModel('module');
                navService.setNavState ( { courseId : course.id , orgId: course.orgId } )
                .then ( function () {
                    navService.go( 'views/main.html',
                        { direction : 'forward',
                            collection: 'module' } );
                });
            };
            $scope.isNative = registryService.getConfig('isNative');

        } );
})(angular,_)// jshint ignore:line
