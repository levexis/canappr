(function ( angular, _ ) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    // how can we dynamically inject the resource, have hard coded organizations for now
    // need current model and then collection for list, eg collectionId 5 is model and courses is the collection etc
    myApp.controller( 'ContentCtrl',
        function ( $scope , registryService, xmlService , domUtils , $log ) {
            var navParams =  registryService.getNavModels();
            function _setContent() {
                $scope.playObj = xmlService.toObject( atob( $scope.model.playlist ) );
                if ( $scope.playObj ) {
                    $scope.content = $scope.playObj.organization.course.module.content;
                    if ( !_.isArray( $scope.content ) ) $scope.content = [$scope.content ];
                } else {
                    $scope.playObj = {};
                }
            }
            $scope.model = navParams[ 'module' ];
            _setContent();
            // keep playObj up to dae
            $scope.$watch('model.playlist', function ( before , after ) {
                if ( before !== after ) _setContent();
            });
            $log.debug('content',$scope);
            /* media player seeking */
            $scope.seekPercentage = function ($event) {
                var offsetX = domUtils.offset(angular.element($event.target)).left,
                    percentage = ( ( $event.clientX - offsetX) / $event.target.offsetWidth);
                if (percentage <= 1) {
                    return percentage;
                } else {
                    return 0;
                }
            }
        } );
})(angular,_);
