var expect = chai.expect;

describe('Main Controller', function () {

    beforeEach( module( 'canAppr' ) );

    describe( 'MainCtrl' , function () {
        var ctrl, scope;

        beforeEach(   inject( function ( $rootScope, $controller ) {
            scope = $rootScope.$new();
            ctrl = $controller( "MainCtrl", {$scope : scope } );
            expect(ctrl).to.not.be.undefined;
        }) );
        it ('should create $scope.collectionClass', function() {
            scope.collectionClass.should.exist;
        });


    });

});