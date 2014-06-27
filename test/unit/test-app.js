var expect = chai.expect;


describe('app.js', function() {

    beforeEach( module( 'canAppr' ) );

    describe( 'TestCtrl' , function () {
        var ctrl, scope;

        beforeEach(   inject( function ( $rootScope, $controller ) {
            scope = $rootScope.$new();
            ctrl = $controller( "TestCtrl", {$scope : scope } );
            expect(ctrl).to.not.be.undefined;
        }) );
        it( 'should have isTester', function () {
            scope.isTester.should.be.ok;
        });
        it( 'should allow us to get location ', inject ( function ( $location ) {
            $location.path().should.equal('');
            expect( scope.isActive('/about') ).to.not.be.ok;
            expect( scope.isActive('/contact')).to.not.be.ok;
        }));

    });

});

