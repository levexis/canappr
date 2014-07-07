(function (angular) {
    "use strict";

    var myApp = angular.module( 'canAppr' );


    myApp.controller( 'MenuCtrl', function ( $scope, $location , $rootScope, orgs , courses, modules ) {
        $scope.options = [];
        /*
            { label: 'Organizations', template:'views/main.html', class: 'fa-male' } ,
            { label: 'Courses', template:'views/main.html', class: 'fa-book' } ,
            { label: 'Modules', template:'views/main.html', class: 'fa-terminal' } ]; */
 //        actually need to fill this in as we go
        $scope.options = [];
//         watch rootscope for nav update, should this be a directive?
        $rootScope.$watch('cannAppr.navParams' , function ( before , after) {
            var navParams = $rootScope.cannAppr.navParams;
            // should be a service?
            function _getLabel (key , api ) {
                if ( !after[key] || before[key].id !== navParams[key].id ) {
                    api.get( { id : navParams[key].id} ).$promise
                        .then( function ( result ) {
                            $scope[ key + 'Name'] = result.name;
                            console.log ( result.name );
                        } );
                }
            }
            $scope.options = [];
            if ( navParams.org  ) {
                $scope.options.push( { label : $scope.orgName, template : 'views/main.html', class : 'fa-male' } );
                _getLabel ( 'org',orgs );
                if ( navParams.course ) {
                    $scope.options.push( { label : $scope.courseName, template : 'views/main.html', class : 'fa-book' } );
                    _getLabel ( 'course',courses );
                    if ( navParams.module ) {
                        $scope.options.push( { label : $scope.moduleName, template : 'views/main.html', class : 'fa-terminal' } );
                        _getLabel ( 'module',modules );
                    }
                }
            }
        } , true );

        console.log( 'Menu initialised', $scope, $location );
    } );
})(angular);
