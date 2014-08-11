(function ( angular, _ ) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    // how can we dynamically inject the resource, have hard coded organizations for now
    // need current model and then collection for list, eg collectionId 5 is model and courses is the collection etc
    myApp.controller( 'ContentCtrl',
        function ( $scope , registryService, xmlService , domUtils , $log , prefService ) {
            var navParams =  registryService.getNavModels(),
                downloadStatus = prefService.isDownloaded ( navParams.course.id , navParams.module.id );
            function _setContent() {
                $scope.playObj = xmlService.toObject( atob( $scope.model.playlist ) );
                if ( $scope.playObj ) {
                    $scope.content = $scope.playObj.organization.course.module.content;
                    if ( !_.isArray( $scope.content ) ) {
                        $scope.content = [ $scope.content ];
                    }
                } else {
                    $scope.playObj = {};
                }
            }
            $scope.model = navParams.module;
            _setContent();
            // keep playObj up to dae
            $scope.$watch('model.playlist', function ( before , after ) {
                if ( before !== after ) {
                    _setContent();
                }
            });
            $scope.isDownloaded = ( downloadStatus === true);
            // will return null or downloading false if delete, true if completed
            $scope.canDownload = typeof downloadStatus === 'boolean';

            $log.debug('content',$scope);

        } );
})(angular,_)// jshint ignore:line
