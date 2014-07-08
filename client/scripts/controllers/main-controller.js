(function (angular) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    /*
     * should this be a service?
     */
    function _queryCB ($scope) {
        return function ( results ) {
            console.log( 'fetched', results.length, results  );
            $scope.collection = results;
        }
    }


    // how can we dynamically inject the resource, have hard coded organizations for now
    // need current model and then collection for list, eg collectionId 5 is model and courses is the collection etc
    myApp.controller( 'MainCtrl',
        function ( $scope, $location, $timeout, $state , $rootScope, orgs , courses, modules ) {

            /* deals with state changes from page elements via ui-router */
            $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
                console.log ('state change event',event, toState, toParams, fromState, fromParams);
                console.log ('stateParams',JSON.stringify($scope.$stateParams));
                if ( $scope.$stateParams && $scope.$state.current.options ) {
                    // set global root params? Update menu?
                    $rootScope['cannAppr']['navParams'][ $scope.$state.current.options.key ] = { id: $scope.$stateParams.id };
                    console.log( 'root.cannAppr.navParams', $rootScope['cannAppr']['navParams']);
                }
                if ($scope.$state.current.options.list === 'orgs' ) {
                    $scope.collectionClass = 'fa-male';
                    // get results, do we need to do a spinner icon?
                    orgs.query( _queryCB( $scope ) );
                    // this ui text should be refactored out elsewhere and scope.name tells us what collection will be or options.list
                    $scope.target = 'courses';
                    $scope.collectionName = 'Organizations';
                } else if ( $scope.$state.current.options.list === 'courses' ) {
                    console.log('courses');
                    $scope.collectionClass = 'fa-book';
                    courses.query( _queryCB( $scope )  );
                    $scope.collectionName = 'Courses';
                    $scope.target = 'modules';
                } else if ( $scope.$state.current.options.list === 'modules' ) {
                    console.log('modules');
                    $scope.collectionClass = 'fa-terminal';
                    modules.query( _queryCB( $scope )  );
                    $scope.target = 'content';
                    $scope.collectionName = 'Modules';
                } else if ( $scope.$state.current.options.list === 'content' ) {
                    // change template
                    $scope.collectionName = 'Content';
                    $scope.collection = [];
                } else {
                    throw new Error ('unrecognized list: ' + $scope.$state.current.options.list );
                }
                // do we need this code block?
                switch (toParams.action) {
                    case 'push':
                        $scope.ons.navigator.pushPage(app.state.current.templateUrl);
                        break;
                    default:
                        if ($scope.ons.splitView) {
                            // $scope.ons.splitView.setMainPage(toState.templateUrl);
                        }
                }

                $timeout(function () {
                    if ($scope.ons.splitView && typeof $scope.ons.splitView.close === 'function') {
                        $scope.ons.splitView.close();
                    }
                }, 100);

                $scope.state = $state.current;
                // end of block
            });
            $scope.collection = [];
            // default state
            $scope.collectionClass = 'fa-male';
            orgs.query( _queryCB ( $scope ) );
            $scope.target = 'courses';
            $scope.collectionName = 'Organizations';

            console.log('MainCtrl init',$scope );

        } );
})(angular);
