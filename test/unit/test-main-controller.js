var expect = chai.expect;

describe('Main Controller', function () {

    beforeEach( module( 'canAppr' ) );

    describe( 'MainCtrl' , function () {
        var ctrl, scope, controller;
        beforeEach(   inject( function ( $rootScope, $controller ) {
            scope = $rootScope.$new();
            controller = $controller;
            ctrl = controller( "MainCtrl", {$scope : scope } );
            expect(ctrl).to.not.be.undefined;
        }) );
        it ('should create $scope.collectionClass', function() {
            scope.collectionClass.should.exist;
        });
        it ('should load place holder / welcome text by default' , function () {
            scope.model.isPlaceholder.should.be.ok;
        });
        // blurb stuff should be in a directive!
        it ('should show blurb by default' , function () {
            scope.showBlurb.should.be.ok;
        });
        describe ( 'Organizations View' , function () {
            beforeEach(  function () {
                scope.options = { collection : 'org'};
                ctrl = controller( "MainCtrl", {$scope : scope } );
            });
            it ('should set collectionName to Organizations' , function () {
                scope.collectionName.should.equal ( 'Organizations');
                scope.target.should.equal ( 'course');
            });
            it ('should set collectionClass to fa-male' , function () {
                scope.collectionClass.should.equal ( 'fa-male');
            });
        });
        describe ( 'Course View' , function () {
            beforeEach(  function () {
                scope.options = { collection : 'course'};
                ctrl = controller( "MainCtrl", {$scope : scope } );
            });
            it ('should set collectionName to Courses' , function () {
                scope.collectionName.should.equal ( 'Courses');
                scope.target.should.equal ( 'module');
            });
            it ('should set collectionClass to fa-book' , function () {
                scope.collectionClass.should.equal ( 'fa-book');
            });
        });
        describe ( 'Modules View' , function () {
            beforeEach(  function () {
                scope.options = { collection : 'module'};
                ctrl = controller( "MainCtrl", {$scope : scope } );
            });
            it ('should set collectionName to Organizations' , function () {
                scope.collectionName.should.equal ( 'Modules' );
                scope.target.should.equal ( 'content' );
            });
            it ('should set collectionClass to fa-terminal' , function () {
                scope.collectionClass.should.equal ( 'fa-terminal');
            });
        });
    });

});