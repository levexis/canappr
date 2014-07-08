var expect = chai.expect;

var app = angular.module( 'canAppr' );

describe('app.js', function() {

    beforeEach( module( 'canAppr' ) );

    describe( 'xml service' , function () {
        var service, scope, ctrl,
            xml = '<file><type>video</type><url>https://dropbox.com/19382/breathing.mp4</url></file>';

        beforeEach( inject( function ( xmlService ) {
            service = xmlService;
            expect(service).to.not.be.undefined;
        }) );
        it( 'should convert valid xml toJSON', function () {
            service.toJSON.should.be.a('function');
            service.toJSON(xml ).should.be.a('string');
//            console.log ( service.toJSON( xml ) );
            service.toJSON(xml ).should.equal('{\n"file":{"type":"video","url":"https://dropbox.com/19382/breathing.mp4"}\n}');
        });
        it( 'should convert valid xml toObject', function () {
            service.toObject.should.be.a('function');
            service.toObject( xml ).should.be.an('object');
            console.log ( service.toObject( xml ) );
            service.toObject( xml ).file.type.should.equal('video');
            service.toObject( xml ).file.url.should.equal('https://dropbox.com/19382/breathing.mp4');
        });
        it( 'should reject invalid xml');
    });

});
