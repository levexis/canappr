(function (angular , _) {
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
    // just resets to default home page
    function _reset ($scope) {
        $scope.model = { name: 'Organizations',
                 html : 'Welcome to my new app, this is just placeholder text' };
    };
    // how can we dynamically inject the resource, have hard coded organizations for now
    // need current model and then collection for list, eg collectionId 5 is model and courses is the collection etc
    myApp.controller( 'MainCtrl',
        function ( $scope, $location, $timeout, $rootScope, orgService , courseService, moduleService ) {
            var navParams =  $rootScope['canAppr']['navParams'],
                options;
            function setModel( nParams ) {
                console.log ('setModel', $scope.collectionName ,  nParams );
                switch ( $scope.collectionName ) {
                    case 'Organizations':
                        $scope.model =  nParams.org;
                        if ( !$scope.model.html ) {
                            _reset( $scope );
                        }
                        break;
                    case 'Courses':
                        $scope.model =  nParams.org;
                        break;
                    case 'Modules':
                        $scope.model =  nParams.course;
                        break;
                    case '':
                        $scope.model =  nParams.module;
                        break;
                }
            }

            if ( $scope.ons.splitView && $scope.ons.splitView.options) {
                options = $scope.ons.splitView.options;
                delete $scope.ons.splitView.options;
            } else {
                try {
                    options = $scope.ons.navigator.getCurrentPage().options;
                } catch ( err ) {
                    // ignore the error, navigator not ready
                }
            }
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
                } else if (options.collection === 'course' ) {
                    $scope.collectionClass = 'fa-book';
                    courseService.query( { organizationId : navParams.org.id }, _queryCB( $scope ) );
                    $scope.collectionName = 'Courses';
                    $scope.target = 'module';
                    navParams.org.id = options.id;
                } else if ( options.collection === 'module' ) {
                    $scope.collectionClass = 'fa-terminal';
                    moduleService.query( { courseId : navParams.course.id }, _queryCB( $scope ) );
                    $scope.target = 'content';
                    $scope.collectionName = 'Modules';
                    navParams.course.id = options.id;
                    $scope.targetTemplate = 'views/content.html';
                } else if ( options.collection === 'content' ) {
                    console.log ('setting mudule id', options.id );
                    navParams.module.id = options.id;
                    $scope.collectionName = '';
                } else if (options.collection ) {
                    throw new Error( 'unrecognized list: ' + options.collection );
                }
            } else {
                console.log( 'loaded', $scope );
                // default state
                $scope.collectionClass = 'fa-male';
                _reset( $scope );
                orgService.query( _queryCB( $scope ) );
                $scope.target = 'course';
                $scope.collectionName = 'Organizations';
            }
            setModel(navParams);
            $rootScope.$watch("canAppr.navParams", function(newValue, oldValue) {
                console.log('changed navParams',newValue);
                setModel(newValue);
            });

/*            $scope.$watch("collection", function(newValue, oldValue) {
                console.log('collection change',newValue.length,oldValue.length,document.getElementsByTagName('li').length,newValue,oldValue);
            });
*/
            $scope.showBlurb=true;
            $scope.clickList = function ( template, options ) {
                $scope.showBlurb=false;

// choose based on whether both views visible, screensize ?
                $scope.ons.navigator.pushPage( template , options);
//                $scope.ons.splitView.options = options;
// add animation class when set main page?
//                $scope.ons.splitView.setMainPage( template );
            }

        } );
})(angular,_);
