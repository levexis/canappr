(function (angular) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    myApp.directive('cdCourseStatus', function( registryService , moduleService , prefService ) {
        var outTemplate='',
            directive;
        outTemplate += '<h3 class="topcoat-list__header ca-home-course ca-clickable"  ng-click="navCourse(course);">{{course.orgName}} - {{course.name}}</h3>';
        outTemplate += '<ul class="topcoat-list ng-scope">';
        outTemplate += '<span class="ng-scope" ng-repeat="module in modules">';
        outTemplate += '<li class="topcoat-list__item--tappable topcoat-list__item__line-height ca-menu-item topcoat-list__item ca-submen" ng-click="navModule(module,course);">';
        outTemplate += '<i class="fa fa-lg fa-file-audio-o ca-arrow-right ca-audio-icon"></i>';
        outTemplate += '<span class="ng-binding ng-scope">{{module.name}}</span>';
        outTemplate += '</li></span>';
        directive = {
            compile: function ( element,attributes) {
                //return link function
                return function ( scope, element, attributes ) {
                    // get the modules which have been downloaded
                    scope.modules = [];
                    // if native then check its downloaded
                    if ( registryService.getConfig( 'isNative' ) ) {
                        moduleService.query( { courseId : scope.course.id }, function ( modules ) {
                            modules.forEach( function ( module ) {
                                if ( prefService.checkCourseFiles( scope.course.id, module ) ) {
                                    scope.modules.push( module );
                                }
                            } );
                        } );
                    }
                };
            },
            restrict: 'E',
            template : outTemplate
        };
        return directive;
    });

})(angular); //jshint ignore:line




