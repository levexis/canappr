(function (angular ) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    // just resets the page model default home page
    function _welcome ($scope) {
        $scope.model = { name: 'Organizations',
                 html : 'Welcome to my new app, this is just placeholder text' };
    }
    /*
     * sets the collection for the page
     */
    function _queryCB ($scope) {
        return function ( results ) {
            $scope.collection = results;
        }
    }
    // how can we dynamically inject the resource, have hard coded organizations for now
    // need current model and then collection for list, eg collectionId 5 is model and courses is the collection etc
    myApp.controller( 'MainCtrl',
        function ( $scope, $location, $timeout, $rootScope, orgService , courseService, moduleService , utilService , registryService) {
            var navParams =  registryService.getNavModels(),
                options = utilService.getRouteOptions($scope);
            $scope.collection = [];
            $scope.targetTemplate = 'views/main.html';
            if ( options ) {
                console.log ('options',options,options.collection, options);
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
                    courseService.query( { organizationId : navParams.org.id }, _queryCB( $scope ) );
                    $scope.collectionName = 'Courses';
                    $scope.target = 'module';
                    $scope.model = navParams[ 'org' ];
                } else if ( options.collection === 'module' ) {
                    $scope.collectionClass = 'fa-terminal';
                    moduleService.query( { courseId : navParams.course.id }, _queryCB( $scope ) );
                    $scope.target = 'content';
                    $scope.collectionName = 'Modules';
                    $scope.targetTemplate = 'views/content.html';
                    $scope.model = navParams[ 'course' ];
                } else if ( options.collection === 'content' ) {
                    console.log ('setting mudule id', options.id );
                    $scope.collectionName = '';
                    $scope.model = navParams[ 'module' ];
                } else if (options.collection ) {
                    throw new Error( 'unrecognized list: ' + options.collection );
                }
                console.log ( 'model', $scope.model ,navParams ,  options.collection );
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
                $scope.showBlurb=false;
                console.log ('clicking options',options);

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
                if (target && options && options.item ) registryService.setNavModel ( target , options.item);
// choose based on whether both views visible, screensize, registry setting ?
                // TODO: this could actually be a service too
                if ( registryService.getConfig().navType === 'push') {
                    $scope.ons.navigator.pushPage( template, options );
                } else {
                    $scope.ons.splitView.options = options;
                    // add animation class when set main page?
                    $scope.ons.splitView.setMainPage( template );
                }
            }

        } );
})( angular );
