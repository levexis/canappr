(function (angular , _) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    // just resets the page model default home page
    function _welcome ($scope) {
        $scope.model = { name: 'Organizations',
                 html : 'Welcome to my new app, this is just placeholder text',
                isPlaceholder: true};
    }
    /*
     * sets the collection for the page
     */
    function _queryCB ($scope) {
        return function ( results ) {
            $scope.collection = results;
            // this someFiltered thing is for the UI and should be refactored into a directive!
            $scope.someFiltered = !!_.findWhere ( results , $scope.filterWhere );
        }
    }
    // how can we dynamically inject the resource, have hard coded organizations for now
    // need current model and then collection for list, eg collectionId 5 is model and courses is the collection etc
    myApp.controller( 'MainCtrl',
        function ( $scope, $rootScope, $log, orgService , courseService, moduleService , registryService, navService, prefService , fileService) {
            var navParams =  $scope.navParams ||  registryService.getNavModels(),
                options = $scope.options || navService.getRouteOptions($scope); // the scope.options / navParams is there to allow test to set these in karma
            $scope.collection = [];
            $scope.targetTemplate = 'views/main.html';
            if ( options ) {
                $log.debug ('options',options,options.collection, options);
                if ( options.collection === 'org' ) {
                    $scope.collectionClass = 'fa-male';
                    // get results, do we need to do a spinner icon?
                    orgService.query( _queryCB( $scope ) );
                    // this ui text should be refactored out elsewhere and scope.name tells us what collection will be or options.list
                    $scope.target = 'course';
                    $scope.collectionName = 'Organizations';
                    _welcome($scope);
                } else if (options.collection === 'course' ) {
                    $scope.collectionClass = 'fa-book';
                    courseService.query( { orgId : navParams.org.id }, _queryCB( $scope ) );
                    // this filter is only really needed when working with local static test data
                    $scope.filterWhere = { orgId : navParams.org.id };
                    $scope.collectionName = 'Courses';
                    $scope.target = 'module';
                    $scope.model = navParams[ 'org' ];
                } else if ( options.collection === 'module' ) {
                    $scope.collectionClass = 'fa-terminal';
                    moduleService.query( { courseId : navParams.course.id }, _queryCB( $scope ) );
                    $scope.filterWhere = { courseId : navParams.course.id };
                    $scope.target = 'content';
                    $scope.collectionName = 'Modules';
                    $scope.targetTemplate = 'views/content.html';
                    $scope.model = navParams[ 'course' ];
                    $scope.canSubscribe = true;
                    $scope.subscribed = prefService.isSubscribed ( navParams.course.id );
                    $scope.$watch('subscribed', function () {
                        if ( $scope.subscribed ) {
                            prefService.subscribeCourse( navParams.course.id );
                        } else {
                            prefService.unsubscribeCourse( navParams.course.id );
                        }
                    });
                } else if ( options.collection === 'content' ) {
                    $log.debug ('setting module id', options.id );
                    $scope.collectionName = '';
                    $scope.model = navParams[ 'module' ];
                } else if (options.collection ) {
                    throw new Error( 'unrecognized list: ' + options.collection );
                }
                $log.debug ( 'model', $scope.model ,navParams ,  options.collection ,$scope);
            } else {
                // initial state
                $scope.collectionClass = 'fa-male';
                _welcome( $scope );
                orgService.query( _queryCB( $scope ) );
                $scope.target = 'course';
                $scope.collectionName = 'Organizations';
            }

            $scope.showBlurb=true;
            $scope.clickList = function ( template, options ) {
                var target;
                $log.debug ('clicking options',options, $scope);
                switch ( $scope.collectionName ) {
                    case 'Organizations':
                        target = 'org';
                        break;
                    case 'Courses':
                        target = 'course';
                        break;
                    case 'Modules':
                        target = 'module';
                        break;
                }
                // update the central model so can be used on next view
                if (target && options && options.item ) registryService.setNavModel ( target , options.item);
                // still pushing for now but seem to have some stack scoping problems, have tried a different template name but seems to be navigator nesting
                if ( registryService.getConfig().navType === 'slide') {
                    $scope.showBlurb=false;
                    $rootScope.ons.navigator.pushPage( template, options );
                } else {
                    navService.go( template , options );
                }
            };

        } );
})( angular , _ ); // jshint ignore:line
