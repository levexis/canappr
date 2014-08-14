(function (angular) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    myApp.directive('cdSwitch', function( registryService ) {
        var templateFn = function (elemente,attributes ) {
            var outTemplate='';
            outTemplate = '<label class="topcoat-switch">';
                outTemplate += '<input type="checkbox" class="topcoat-switch__input"';
// maybe add a click event just for testing in karma?
                outTemplate += ' ng-model="' + attributes.model + '"';
                outTemplate += ' ng-disabled="' + (!!attributes.disabled ) + '">';
                outTemplate += '<span class="topcoat-switch__toggle ca-switch"></span>';
                outTemplate += '</label>';
            return outTemplate;
        };

        var directive = {
            restrict: 'E',
            template : templateFn
        };
        return directive;
    });
    myApp.directive('cdBody', function( registryService ) {
        var outTemplate;
        // push thing didn't go very will so disabled
        if ( false && registryService.getConfig('isPhoneGap')) {
            outTemplate = '<ons-screen page="views/sliding-menu.html"></ons-screen>';
            registryService.setConfig('navType','slide');
        } else {
            outTemplate = '<ons-screen page="views/split-view.html"></ons-screen>';
            registryService.setConfig('navType','split');
        }
        return {
            restrict: "E",
            template : outTemplate
        };
    });
    myApp.directive('cdNavBar', function( navService ) {
        var outTemplate='';
            outTemplate += '<div style="margin: 1px 0px;" class="topcoat-list__item__line-height ca-navcan topcoat-list__item" ng-show="isSingle">';
            outTemplate += '<i class="fa fa-chevron-left" ng-show="last" ng-click="goBack()">';
            outTemplate += '<span class="ca-back">{{last}}</span></i>';
            outTemplate += '<i class="fa fa-lg fa-bars ca-menu-icon" ng-click="toggleMenu()">&nbsp;</i></div>';
        return {
            restrict : "E",
            link : function ( $scope, element, attributes ) {
                $scope.goBack = function () {
                    navService.go ( 'views/main.html' ,{ collection : navService.getCollection( $scope.last ) ,
                                                        navDir : 'back' });
                };
                $scope.isSingle=navService.isSingle();
                console.log ('isSingle',$scope.isSingle);
                $scope.toggleMenu = navService.toggleMenu;
            },
            template: outTemplate
        };
    });
    myApp.directive('cdTransition', function ( $log ) {
        return {
            restrict : "A",
            compile: function(el,attr) {
                el.removeAttr( 'cd-transition' ); // necessary to avoid infinite compile loop
                attr.$set ('style' , 'animation-duration: 0.5s;');
//              had problems compiling this but this was probably a scope issue as transclude errors. if scope is defined as 1 way binding then
//              could probably call compile safely. Anyway have added classes manually which does the trick
//                attr.$set ('ng-class' , '{ \'animated\': ready ,\'bounceInRight\': ready && !options.goneBack ,\'bounceInLeft\': ready && options.goneBack }');
                // return link function
                return function( $scope,element,attribute) {
                    $scope.$watch('navDir', function ( navDir ) {
                        el.addClass( 'animated' );
                        $log.debug('ready',navDir);
                        if ( navDir ==='back' ) {
                                el.addClass( 'slideInLeft' );
                        } else if ( navDir ==='new' ) {
                                el.addClass( 'fadeIn' );
                        } else if ( navDir ==='forward' ) {
                            el.addClass( 'slideInRight' );
                        } else if ( navDir) {
                            // allow explicit transition
                            el.addClass( navDir );
                        }
                    });
                };

            }
        };
    });

})(angular); //jshint ignore:line




