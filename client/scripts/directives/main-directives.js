(function (angular) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    myApp.directive('cdSwitch', function( registryService ) {
        var templateFn = function (elemente,attributes ) {
            var outTemplate = '<label class="topcoat-switch">';
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
})(angular);

