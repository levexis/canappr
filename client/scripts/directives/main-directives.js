(function (angular) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    // couldn't get 2 way bindings to work, needed to use an explicit watch
    myApp.directive('cdMenu', function( $rootScope ) {
        console.log( 'dir created' );
        var directive = {
            compile : function ( element, attributes ) {
                // do one-time configuration of element.
                var linkFunction = function ( $scope, element, attributes ) {
                    // this binds the label to the rootScope changes picked
                    console.log ( 'directive', $scope.item.name ,  $scope.models[  $scope.item.name ], $rootScope.canAppr.navParams);
                    //$scope.item.model = $rootScope.canAppr.navParams[  $scope.item.name ];
                    $scope.options[$scope.$index].model = { name: $rootScope.canAppr.navParams[  $scope.item.name ].id };
                }
                return linkFunction;
            }
        };
        return directive;
    });
})(angular);