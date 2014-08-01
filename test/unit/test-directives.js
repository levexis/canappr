var expect = chai.expect;


describe('directives', function() {
    var elm,scope;
    beforeEach ( module('canAppr') );
    /*
    describe('cdContent', function() {
        beforeEach( inject( function ( $rootScope, $compile , $httpBackend) {
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
        beforeEach( inject( function ( $rootScope, $compile , $httpBackend) {
            $httpBackend.whenGET(/views\/.*/).respond(200,'mocking view');
            /* heres the encoded xml
             <file>
             <owner>paul</owner>
             <type>audio</type>
             </filgit pue>
             */
            elm = angular.element(
                '<cd-play-item src="http://www.soundjay.com/human/fart-01.mp3"></cd-content>');
            scope = $rootScope;
            $compile( elm )( scope );
            // getting an error here but that may be because there is no $index - this is designed to work through ng-repeat at moment
//            scope.$digest();
        } ) );
        it( 'should return audio player', function() {
            elm.html().should.contain('<audio media-player="');
        });
    });
});