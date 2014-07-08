var expect = chai.expect;

var app = angular.module( 'canAppr' );
app.controller ( 'testServices' , function ( $scope, xmlService ) {
    console.log('initiated');
});
describe('app.js', function() {

    beforeEach( angular.module( 'canAppr' ) );

    describe( 'xml service' , function () {
        var xmlService, scope,
            xml = '<file><type>video</type><url>https://dropbox.com/19382/breathing.mp4</url></file>';

        beforeEach( function ( $injector ) {
            //xmlService = $injector.get( "xmlService" );
            xmlService = true;

            expect(xmlService).to.not.be.undefined;
        } );
        it( 'should convert valid xml', function () {
            xmlService(xml ).should.exist;
        });
        it( 'should reject invalid xml');
    });

});

