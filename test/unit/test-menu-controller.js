var expect = chai.expect;

describe('Main Controller', function () {

    beforeEach( module( 'canAppr' ) );

    describe( 'MenuCtrl' , function () {
        var ctrl, scope, controller, registry;
        beforeEach(   inject( function ( $rootScope, $controller , registryService ) {
            scope = $rootScope.$new();
            controller = $controller;
            registry = registryService;
            ctrl = controller( "ContentCtrl", {$scope : scope } );
            expect(ctrl).to.not.be.undefined;
        }));
        it ( 'should have tests');
    });

});