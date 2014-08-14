(function ( angular, _ ) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    // how can we dynamically inject the resource, have hard coded organizations for now
    // need current model and then collection for list, eg collectionId 5 is model and courses is the collection etc
    myApp.controller( 'ContentCtrl',
        function ( $scope , $rootScope, registryService, xmlService , domUtils , $log , prefService , navService , fileService) {
            var navParams =  registryService.getNavModels(),
                options = $scope.options || navService.getRouteOptions($scope) || {};
            function _setContent() {
                $scope.playObj = xmlService.toObject( atob( $scope.model.playlist ) );
                if ( $scope.playObj ) {
                    $scope.content = $scope.playObj.organization.course.module.content;
                    // expects an array of things to play
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
            $rootScope.watch('canAppr.prefs.module', function () {
                $scope.isDownloaded = prefService.isDownloaded();
                // will return null or downloading false if delete, true if completed
                $scope.canDownload = $scope.isDownloaded() || prefService.wasDeleted();
            });
            $scope.isSubscribed = prefService.isSubscribed();
            $scope.navDir=options.navDir || 'new';
            $scope.last = 'Modules';
            $scope.$watch ('isDownloaded', function ( now, before ) {
                if ( now === true && before === false ) {
                    fileService.downloadURL( $scope.content.src,
                        registryService.getModuleId,
                        registryService.getCourseId + '.mp3' );
                }
            });
        } );
})(angular,_)// jshint ignore:line
