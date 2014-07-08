(function (angular) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    /*
     * should this be a service?
     */
    function _queryCB ($scope) {
        return function ( results ) {
            $scope.collection = results;
        }
    }
    function _reset ($scope) {
        $scope.model = { name: 'Organizations',
                 html : 'Welcome to my new app, this is just placeholder text' };
    };

    // how can we dynamically inject the resource, have hard coded organizations for now
    // need current model and then collection for list, eg collectionId 5 is model and courses is the collection etc
    myApp.controller( 'MainCtrl',
        function ( $scope, $location, $timeout, $state , $rootScope, orgs , courses, modules ) {

            /* deals with state changes from page elements via ui-router */
            $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
                console.log('main-change');
                var navParams =  $rootScope['canAppr']['navParams'];
                if ( $scope.$stateParams && $scope.$state.current.options ) {
                    // set global root params? Update menu?
                    if ($scope.$state.current.options.reset ) {
                        // this is to reset the menu to show organizations again
                        navParams.org = navParams.course = navParams.module = {};
                    } else if ( $scope.$stateParams && $scope.$state.current.options.key ) {
                        navParams[ $scope.$state.current.options.key ].id =  $scope.$stateParams.id;
                    }
                }
                if ($scope.$state.current.options.list === 'orgs' ) {
                    $scope.collectionClass = 'fa-male';
                    // get results, do we need to do a spinner icon?
                    orgs.query( _queryCB( $scope ) );
                    // this ui text should be refactored out elsewhere and scope.name tells us what collection will be or options.list
                    $scope.target = 'courses';
                    $scope.collectionName = 'Organizations';
                } else if ( $scope.$state.current.options.list === 'courses' ) {
                    $scope.collectionClass = 'fa-book';
                    courses.query(  { organizationId : navParams.org.id } , _queryCB( $scope ) );
                    $scope.collectionName = 'Courses';
                    $scope.target = 'modules';
                } else if ( $scope.$state.current.options.list === 'modules' ) {
                    $scope.collectionClass = 'fa-terminal';
                    modules.query(  { courseId : navParams.course.id } , _queryCB( $scope ) );
                    $scope.target = 'content';
                    $scope.collectionName = 'Modules';
                } else if ( $scope.$state.current.options.list === 'content' ) {
                    // change template
                    $scope.collectionName = 'Content';
                    $scope.collection = [];
                } else if ( $scope.$state.current.options.list ) {
                    throw new Error ('unrecognized list: ' + $scope.$state.current.options.list );
                }
                function setModel () {
                    switch ( $scope.$state.current.name ) {
                        case 'organizations':
                            $scope.model = navParams.org;
                            if ( !$scope.model.html ) {
                                _reset( $scope );
                            }
                            break;
                        case 'courses':
                            $scope.model = navParams.org;
                            break;
                        case 'modules':
                            $scope.model = navParams.course;
                            break;
                        case 'content':
                            $scope.model = navParams.module;
                            break;
                    }
                }
                setModel();
                // watch for changes if loading
                $rootScope.$watch('canAppr.navParams', setModel, true);
            });
            $scope.collection = [];
            // default state
            $scope.collectionClass = 'fa-male';
            _reset($scope);
            orgs.query( _queryCB ( $scope ) );
            $scope.target = 'courses';
            $scope.collectionName = 'Organizations';
        } );
})(angular);
