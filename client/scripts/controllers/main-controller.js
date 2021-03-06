(function (angular , _) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    // just resets the page model default home page
    function _welcome ($scope) {
        $scope.model = { name: 'Organizations',
                 html : '<p>Select an organization and then browse for courses which interest you. Switch on a course and all current and future modules will be downloaded for you to access offline.</p>',
                isPlaceholder: true};
    }

    // how can we dynamically inject the resource, have hard coded organizations for now
    // need current model and then collection for list, eg collectionId 5 is model and courses is the collection etc
    myApp.controller( 'MainCtrl',
        function ( $scope, $rootScope, $log, orgService , courseService, moduleService , registryService, navService, prefService , fileService, analService) {
            /*
             * sets the collection for the page filtering on $scope.filterWhere if set
             */
            function _queryCB ($scope) {
                return function ( results ) {
                    if ( $scope.filterWhere ) {
                        $scope.collection = _.where( results, $scope.filterWhere ) || [];
                    } else {
                        $scope.collection = results;
                    }
                    $scope.someFiltered = !!$scope.collection.length;
                };
            }
            var navParams =  $scope.navParams ||  registryService.getNavModels(),
                options = $scope.options || navService.getRouteOptions($scope) || {}; // the scope.options / navParams is there to allow test to set these in karma
            $scope.collection = [];
            $scope.targetTemplate = 'views/main.html';
            if ( options.collection ) {
                $log.debug ('options',options,options.collection, options);
                if ( options.collection === 'org' ) {
                    $scope.collectionClass = 'fa-male';
                    // get results, do we need to do a spinner icon?
                    orgService.query( _queryCB( $scope ) );
                    // this ui text should be refactored out elsewhere and scope.name tells us what collection will be or options.list
                    $scope.target = 'course';
                    $scope.collectionName = 'Organizations';
                    _welcome($scope);
                    $scope.last = 'Home';
                } else if (options.collection === 'course' ) {
                    $scope.collectionClass = 'fa-book';
                    courseService.query( { orgId : navParams.org.id }, _queryCB( $scope ) );
                    // this filter is only really needed when working with local static test data
                    $scope.filterWhere = { orgId : navParams.org.id };
                    $scope.collectionName = 'Courses';
                    $scope.target = 'module';
                    $scope.model = navParams.org;
                    $scope.last = 'Organizations';
                } else if ( options.collection === 'module' ) {
                    $scope.collectionClass = 'fa-terminal';
                    moduleService.query( { courseId : navParams.course.id }, _queryCB( $scope ) );
                    // filterWhere gets passed through to template - it's used to fix issues with local API ignoring query string
                    // that could be done by a directive but no reason why other searches couldn't be done by
                    $scope.filterWhere = { courseId : navParams.course.id };
                    $scope.target = 'content';
                    $scope.collectionName = 'Modules';
                    $scope.targetTemplate = 'views/content.html';
                    $scope.model = navParams.course;
                    $scope.canSubscribe = true;
                    $scope.subscribed = prefService.isSubscribed ();
                    $scope.last = 'Courses';
                    // should use an object eg model.subscribed or you can get into fun and games if using
                    // with child scopes via sub-controllers and directives
                    $scope.$watch('subscribed', function ( subscribed , wasSubscribed) {
                        if ( subscribed  && !wasSubscribed) {
                            // pass in current module list so downloading can start
                            analService.trackEvent('course' , 'subscribe', $scope.model.name , $scope.model.id);
                            prefService.subscribeCourse( $scope.model.id , $scope.collection );
                        } else if ( !subscribed && wasSubscribed ) {
                            analService.trackEvent('course' , 'unsubscribe', $scope.model.name , $scope.model.id);
                            prefService.unsubscribeCourse( );
                        }
                    });
                } else if ( options.collection === 'content' ) {
                    $log.debug ('setting module id', options.id );
                    $scope.collectionName = '';
                    $scope.model = navParams.module;
                    $scope.last = 'Modules';
                } else if (options.collection ) {
                    throw new Error( 'unrecognized list: ' + options.collection );
                }
                $log.debug ( 'model', $scope.model ,navParams ,  options.collection ,$scope);
            } else {
                // initial state - THIS SHOULD NOW BE REDUNDANT AS IT STARTS AT HOME
                $scope.collectionClass = 'fa-male';
                _welcome( $scope );
                orgService.query( _queryCB( $scope ) );
                $scope.target = 'course';
                $scope.collectionName = 'Organizations';
            }
            $scope.clickList = function ( template, options ) {
                var target;
                options.navDir = 'forward';
                $log.debug ('clicking options',options, $scope);
                target = navService.getCollection ( $scope.collectionName );

                // update the central model so can be used on next view
                if (target && options && options.item ) {
                    registryService.setNavModel( target, options.item );
                }
                // still pushing for now but seem to have some stack scoping problems, have tried a different template name but seems to be navigator nesting
                if ( registryService.getConfig().navType === 'slide') {
                    $scope.showBlurb=false;
                    $rootScope.ons.navigator.pushPage( template, options );
                } else {
                    navService.go( template , options );
                }
            };
            // used to trigger transitions as onsen not using router
            $scope.navDir=options.navDir || 'new';
        } );
})( angular , _ ); // jshint ignore:line
