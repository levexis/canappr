var expect = chai.expect;

var app = angular.module( 'canAppr' );
mockedApp = angular.module('mockAppr', ['canAppr', 'ngMockE2E']);
// this allows for passThrough via ngMockE2E but have to create a mock app module to call
mockedApp.run(function($httpBackend) {
    /*
    phones = [{name: 'phone1'}, {name: 'phone2'}];

    // returns the current list of phones
    $httpBackend.whenGET('/phones').respond(phones);

    // adds a new phone to the phones array
    $httpBackend.whenPOST('/phones').respond(function(method, url, data) {
        var phone = angular.fromJson(data);
        phones.push(phone);
        return [200, phone, {}];
    });
     //...
     $httpBackend.whenGET('/hello').respond(function(method, url, data) {
     console.log('intercepted',method,url,data);
     });
    */
    // passthrough is a nightmare... https://github.com/angular/angular.js/issues/1434
    $httpBackend.whenGET(/^\/views\/.*/).passThrough();
});


describe('Services', function() {

//    beforeEach( module( 'mockAppr' ) );
    beforeEach( module( 'canAppr' ) );

    describe('libs', function() {

        describe( 'xml', function () {
            var service,
                xml = '<file><type>video</type><url>https://dropbox.com/19382/breathing.mp4</url></file>';

            beforeEach( inject( function ( xmlService ) {
                service = xmlService;
                expect( service ).to.not.be.undefined;
            } ) );
            it( 'should convert valid xml toJSON', function () {
                service.toJSON.should.be.a( 'function' );
                service.toJSON( xml ).should.be.a( 'string' );
                service.toJSON( xml ).should.equal( '{\n"file":{"type":"video","url":"https://dropbox.com/19382/breathing.mp4"}\n}' );
            } );
            it( 'should convert valid xml toObject', function () {
                service.toObject.should.be.a( 'function' );
                service.toObject( xml ).should.be.an( 'object' );
                service.toObject( xml ).file.type.should.equal( 'video' );
                service.toObject( xml ).file.url.should.equal( 'https://dropbox.com/19382/breathing.mp4' );
            } );
            it( 'should return null if xml invalid', function () {
                expect( service.toJSON( '<poo><cock></cock>' ) ).to.be.null;
                expect( service.toObject( '' ) ).to.be.null;
                expect( service.toObject() ).to.be.null;
                expect( service.toObject( null ) ).to.be.null;
                expect( service.toObject( '<poo><cock></cock>' ) ).to.be.null;
            } );
        } );
    })

    describe( 'api' , function () {
        var backend, service, scope,ctrl,apiBase,getSpy;
        // these mocks should all be one service
        beforeEach( inject( function ( $httpBackend , $rootScope , $http ) {
            backend = $httpBackend;
            // doesn't ever get called as we have httpBackend,
//            backend.whenGET(/views\/.*/).passThrough();
            // passthrough is a nightmare... https://github.com/angular/angular.js/issues/1434
            // seems you cannot load local files in karma unit tests
            getSpy = sinon.spy( $http.get );
            apiBase = $rootScope.canAppr.apiBase;
            backend.whenGET(/views\/.*/).respond(200,'mocking view');
            // ignore the views
            backend.flush();
            backend.verifyNoOutstandingExpectation();
            backend.verifyNoOutstandingRequest();
        }));
        describe('orgService', function () {
            beforeEach( inject( function ( orgService ) {
                service = orgService;
                expect(service).to.not.be.undefined;
                // make sure we start clean
                backend.expectGET(apiBase + 'organizations').respond(200, [{mock: 'hello'}]);
            }) );
            afterEach(function() {
                backend.verifyNoOutstandingExpectation();
                backend.verifyNoOutstandingRequest();
            });
            it('should be a cachedResource', function () {
                service.query().$promise.should.be.an( 'object' );
                backend.flush();
            });
            it('should return empty from cache', function () {
                service.query().$promise.then ( function ( results ) {
                    results.length.should.equal(0);
                } );
                backend.flush();
            });
            it('should return 1 from server', function () {
                service.query().$httpPromise.then ( function ( results ) {
                    results[0].mock.should.equal('hello');
                } );
                backend.flush();
            });
        });
        describe('courseService', function () {
            beforeEach( inject( function ( courseService ) {
                service = courseService;
                expect(service).to.not.be.undefined;
                // make sure we start clean
                backend.expectGET(apiBase + 'courses').respond(200, [{mock: 'hello'}]);
            }) );
            afterEach(function() {
                backend.verifyNoOutstandingExpectation();
                backend.verifyNoOutstandingRequest();
            });
            it('should be a cachedResource', function () {
                service.query().$promise.should.be.an( 'object' );
                backend.flush();
            });
            it('should return empty from cache', function () {
                service.query().$promise.then ( function ( results ) {
                    results.length.should.equal(0);
                } );
                backend.flush();
            });
            it('should return 1 from server', function () {
                service.query().$httpPromise.then ( function ( results ) {
                    results[0].mock.should.equal('hello');
                } );
                backend.flush();
            });
        });
        describe('moduleService', function () {
            beforeEach( inject( function ( moduleService ) {
                service = moduleService;
                expect(service).to.not.be.undefined;
                // make sure we start clean
                backend.expectGET(apiBase + 'modules').respond(200, [{mock: 'hello'}]);
            }) );
            afterEach(function() {
                backend.verifyNoOutstandingExpectation();
                backend.verifyNoOutstandingRequest();
            });
            it('should be a cachedResource', function () {
                service.query().$promise.should.be.an( 'object' );
                backend.flush();
            });
            it('should return empty from cache', function () {
                service.query().$promise.then ( function ( results ) {
                    results.length.should.equal(0);
                } );
                backend.flush();
            });
            it('should return 1 from server', function () {
                service.query().$httpPromise.then ( function ( results ) {
                    results[0].mock.should.equal('hello');
                } );
                backend.flush();
            });
        });

    });

});
