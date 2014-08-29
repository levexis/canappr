(function (angular) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    // watches rootScope for ready
    myApp.directive('cdCourseStatus', function( $rootScope, $log, registryService , moduleService , prefService ) {
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
                    function getModules() {
                        moduleService.query( { courseId : scope.course.id }, function ( modules ) {
                            modules.forEach( function ( module ) {
                                if ( scope.course.id === module.courseId &&
                                    prefService.isDownloaded ( module ) ) {
                                    scope.modules.push( module );
                                }
                            } );
                        } );
                    }
                    // if native then check its downloaded
                    if ( registryService.getConfig( 'isNative' ) ) {
                        if ( !registryService.isReady() ) {
                            // wait for file table to be ready before checking
                            $rootScope.$watch( 'canAppr.ready', function ( ready, wasReady ) {
                                if ( ready && !wasReady ) {
                                    getModules();
                                }
                            } );
                        } else {
                            getModules();
                        }
                    }
                };
            },
            restrict: 'E',
            template : outTemplate
        };
        return directive;
    });
    // watches isReady and hides splash screen when it's true
    myApp.directive('cdSplash',  function( $rootScope , $timeout, registryService) {
        // use rootscope and directive for this?
        function hideSplash( hide ) {
//            var el =  angular.element( document.getElementById('splash' )).addClass('fadeOut');
            if ( hide ) {
                el.addClass('animated fadeOut');
                // there must be an auto fix to this, i think animate.css just sets opactity to 1
                // could do a cleanup where anything invisible is
                $timeout( function () {
                    el.addClass( 'ca-hide' );
                }, 1000 );
            }
        }
        var el, directive = {
            compile: function ( element,attributes) {
               el = element;
//               el.style =  'animation-duration: 2s';
               // watch after linking just to avoid a race condition
                if ( !registryService.getConfig( 'isE2E' ) ) {
                    return function ( scope, element, attributes ) {
                        $rootScope.$watch( 'canAppr.ready', hideSplash );
                    };
                } else {
                    // hide ths splash screen
                    element.addClass( 'ca-hide' );
                }
            },
            restrict: 'E',
            template : '<div id="splash"></div>'
        };
    });

})(angular); //jshint ignore:line




