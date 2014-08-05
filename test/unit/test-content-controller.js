var expect = chai.expect;

describe('Main Controller', function () {

    beforeEach( module( 'canAppr' ) );

    describe( 'ContentCtrl' , function () {
        var ctrl, scope, controller;
        beforeEach(   inject( function ( $rootScope, $controller , registryService ) {
            scope = $rootScope.$new();
            controller = $controller;
            registryService.setNavModel( 'module', { playlist : 'PG9yZ2FuaXphdGlvbiBpZD0iMSI+DQogICAgPGNvdXJzZSBpZD0iMSI+DQogICAgICAgPG1vZHVsZSBpZD0iMSI+DQogICAgICAgICAgPGNvbnRlbnQ+DQogICAgICAgICAgICA8ZGVzY3JpcHRpb24+QXdhcmVuZXNzIE9mIFRoZSBCb2R5PC9kZXNjcmlwdGlvbj4gDQogICAgICAgICAgICA8b3duZXI+ZGgucC5kYWtpbmlAZ21haWwuY29tPC9vd25lcj4NCiAgICAgICAgICAgIDx0aW1lPjE4MDA8L3RpbWU+IA0KICAgICAgICAgICAgPHNpemU+Mjk8L3NpemU+DQogICAgICAgICAgICA8ZmlsZT4NCiAgICAgICAgICAgICAgICA8dHlwZT5hdWRpbzwvdHlwZT4NCiAgICAgICAgICAgICAgICA8dXJsPmh0dHBzJTNBJTJGJTJGZGwuZHJvcGJveHVzZXJjb250ZW50LmNvbSUyRnUlMkYxMTIwNDUzJTJGdHJpcmF0bmElMkZib2R5LjEyOC5tcDM8L3VybD4NCiAgICAgICAgICAgIDwvZmlsZT4gICAgICAgICAgICAgICAgDQogICAgICAgICAgPC9jb250ZW50Pg0KICAgICAgIDwvbW9kdWxlPg0KICAgIDwvY291cnNlPg0KPC9vcmdhbml6YXRpb24+DQo=',
                name: 'test' } );
            ctrl = controller( "ContentCtrl", {$scope : scope } );
            expect(ctrl).to.not.be.undefined;
        }));
        it ( 'should set model' , function () {
            scope.model.should.exist;
            scope.model.name.should.equal ('test');
        });
        it ( 'should convert playlist to an object' , function () {
            scope.playObj.should.exist;
            scope.playObj.organization.course.module.content.owner.should.equal('dh.p.dakini@gmail.com');
        });
    });

});