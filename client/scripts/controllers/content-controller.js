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
                // todo: the whole area of coverting content xml should be a service as we keep redoing the same things to the same files
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
                $log.debug('content',$scope.content);
            }
            $scope.model = navParams.module;
            _setContent();
            // keep playObj up to dae
            $scope.$watch('model.playlist', function ( before , after ) {
                if ( before !== after ) {
                    _setContent();
                }
            });
            if ( registryService.getConfig ('isNative') ) {
                $rootScope.$watch( 'canAppr.prefs.module', function ( module ) {
                    $scope.isDownloaded = prefService.isDownloaded( $scope.model );
                    // will return null or downloading false if delete, true if completed
                    $scope.disableDownload = !prefService.isModuleReady( null, $scope.model );
                    $log.debug( 'module status', $scope.isDownloaded, $scope.canDownload, module );
                } );
            } else {
                $scope.isDownloaded = true;
                $scope.disableDownload = false;
            }
            $scope.isSubscribed = prefService.isSubscribed();
            $scope.navDir=options.navDir || 'new';
            $scope.last = 'Modules';
            // handles download / delete switch
            $scope.$watch ('isDownloaded', function ( now, before ) {
                if ( now === true && before === false ) {
                    _.forEach ($scope.content , function ( item) {
                        if ( item.file ) {
                            fileService.redownload( decodeURIComponent( item.file.url ) );
                        }
                    });
                // delete content
                } else if ( now === false && before === true ) {
                    _.forEach ($scope.content , function ( item) {
                        if ( item.file ) {
                            fileService.clearFile( decodeURIComponent( item.file.url ) );
                        }
                    });
                    $scope.notAvailable = !fileService.canDownload();
                    // reset URL
                    _setContent();
                }
            });
        } );
})(angular,_)// jshint ignore:line
