var expect = chai.expect;
// these are a bit shite, need to look into directive testing without using angular

describe('directives', function() {
    var elm,scope,
        isPhantom = !( navigator.userAgent.indexOf('PhantomJS'===-1) );
    beforeEach ( module('canAppr') );
//    describe('cdContent', function() {
//        beforeEach( inject( function ( $rootScope, $compile , $httpBackend) {
             // stub the views or you get errors
            // $httpBackend.whenGET(/views\/.*/).respond(200,'mocking view');
            /*
            /* heres the encoded xml
            <file>
                <owner>paul</owner>
                <type>audio</type>
            </filgit pue>
            elm = angular.element(
                '<cd-content playlist="PGZpbGU+DQogICAgPG93bmVyPnBhdWw8L293bmVyPg0KICAgIDx0eXBlPmF1ZGlvPC90eXBlPg0KPC9maWxlPiA="></cd-content>');

            scope = $rootScope;
            $compile( elm )( scope );
            scope.$digest();
        } ) );
        it( 'should decode the playlist', function() {
            elm.scope().playObj.should.exist;
            elm.scope().playObj.should.deep.equal( { file: { owner: "paul" , type: "audio" } } );
            JSON.parse (elm.find('div').text()).should.deep.equal( { file: { owner: "paul" , type: "audio" } } );
        });
    });
    */
    describe('cdPlayItem', function() {
        beforeEach( inject( function ( $rootScope, $compile ) {
            // don't try this at home
            elm = angular.element(
                '<cd-play-item src="http://www.soundjay.com/human/fart-01.mp3"></cd-play-item>');
            scope = $rootScope.$new();
            $compile( elm )( scope );
            // don't compile if phantom as gets a dom error as element not quite created correctly
            if (isPhantom) scope.$digest();
        } ) );
        it( 'should return audio player', function() {
            elm.html().should.contain('<audio media-player="');
        });
    });
    describe('cdSwitch', function() {
        beforeEach( inject( function ( $rootScope, $compile ) {
            // don't try this at home
            elm = angular.element(
                '<cd-switch model="switched" disabled="disabled"></cd-switch>');
            scope = $rootScope.$new();
            $compile( elm )( scope );
            // don't compile if phantom as gets a dom error as element not quite created correctly
            scope.$digest();
        } ) );
        it( 'should return a checkbox', function() {
            elm.html().should.contain('type="checkbox"');
        });
        it( 'should accept a disabled flag', function() {
 //           elm.html().should.contain('<input type="checkbox"');
        });
        /*
        it( 'should toggle the model', function(done) {
            expect ( scope.switched ).to.be.undefined;
            $(elm ).click();
            setTimeout ( function () {
                console.log( $( elm ).find( 'input' ).is(':checked') );
                expect( $( elm ).find( 'input' ) ).to.be.ok;
                done();
            },1000);
        });
         */
    });
});