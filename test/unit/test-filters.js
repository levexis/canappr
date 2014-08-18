var expect = chai.expect;


describe('filters', function() {

    describe ('generic example',function () {
        var filter;
        beforeEach( function () {
            // how to run a module!
            module.apply( 'canAppr' );
            inject( function ( $injector ) {
                filter = $injector.get( '$filter' )( 'number' );
            } );
        } );

        it( 'should format a number', function () {
            expect( filter( '123456' ) ).to.equal( '123,456' );
        } );
    });
    describe ('content' , function() {
        describe( 'cfURLDecode', function () {
            it( 'should have some tests' );
        } );
        describe( 'cftrustUrl', function () {
            it( 'should have some tests' );
        } );
        describe( 'cfSecShow', function () {
            it( 'should have some tests' );
        } );
   });
});

