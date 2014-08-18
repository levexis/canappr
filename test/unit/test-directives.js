var expect = chai.expect;
// these are a bit shite, need to look into directive testing without using angular

describe('directives', function() {
    var elm,scope,
        isPhantom = !( navigator.userAgent.indexOf('PhantomJS'===-1) );
    beforeEach ( module('canAppr') );
    describe ('content directives' , function () {
        describe( 'cdPlayItem', function () {
            beforeEach( inject( function ( $rootScope, $compile ) {
                // don't try this at home
                elm = angular.element(
                    '<cd-play-item src="http://www.soundjay.com/human/fart-01.mp3"></cd-play-item>' );
                scope = $rootScope.$new();
                $compile( elm )( scope );
                // don't compile if phantom as gets a dom error as element not quite created correctly
                if ( isPhantom ) scope.$digest();
            } ) );
            it( 'should return audio player', function () {
                elm.html().should.contain( '<audio media-player="' );
            } );
            it( 'should create click function', function () {
                scope.seekPercentage.should.be.a( 'function' );
            } );

        } );
    });
    describe('main directives', function () {
        describe( 'cdSwitch', function () {
            beforeEach( inject( function ( $rootScope, $compile ) {
                // don't try this at home
                elm = angular.element(
                    '<cd-switch model="switched" disabled="disabled"></cd-switch>' );
                scope = $rootScope.$new();
                $compile( elm )( scope );
                // don't compile if phantom as gets a dom error as element not quite created correctly
                scope.$digest();
            } ) );
            it( 'should return a checkbox', function () {
                elm.html().should.contain( 'type="checkbox"' );
            } );
            it( 'should accept a disabled flag', function () {
                //           elm.html().should.contain('<input type="checkbox"');
            } );
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
        } );
        describe( 'cdTransition', function () {
            it( 'should have some tests' );
        } );
        describe( 'cdNavBar', function () {
            it( 'should have some tests' );
        } );
    });
    describe('menu directives', function() {
        describe('cdMenu', function() {
            it( 'should have some tests' );
        });
    });

});