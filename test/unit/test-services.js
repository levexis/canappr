var expect = chai.expect;

var app = angular.module( 'canAppr' );

describe('app.js', function() {

    beforeEach( module( 'canAppr' ) );

    describe( 'xml service' , function () {
        var service, scope, ctrl
            xml = '<file><type>video</type><url>https://dropbox.com/19382/breathing.mp4</url></file>';

        beforeEach( inject( function ( xmlService ) {
            service = xmlService;
            expect(service).to.not.be.undefined;
        }) );
        it( 'should convert valid xml', function () {
            service.should.exist;
        });
        it( 'should reject invalid xml');
    });

});
