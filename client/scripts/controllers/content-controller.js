(function (angular , _) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    // how can we dynamically inject the resource, have hard coded organizations for now
    // need current model and then collection for list, eg collectionId 5 is model and courses is the collection etc
    myApp.controller( 'ContentCtrl',
        function ( $scope, $location, $timeout, $rootScope, orgService , courseService, moduleService , utilService , registryService) {
            var navParams =  registryService.getNavModels();
            $scope.model = navParams[ 'module' ];
        } );
})(angular,_);
