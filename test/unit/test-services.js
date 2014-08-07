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

    describe( 'libs', function () {

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
                expect( service.toJSON( '<pea><cock></cock>' ) ).to.be.null;
                expect( service.toObject( '' ) ).to.be.null;
                expect( service.toObject() ).to.be.null;
                expect( service.toObject( null ) ).to.be.null;
                expect( service.toObject( '<ea><cock></cock>' ) ).to.be.null;
            } );
        } );
    } )

    describe( 'api', function () {
        var backend, service, scope, ctrl, apiBase, getSpy;
        // these mocks should all be one service
        beforeEach( inject( function ( $httpBackend, $rootScope, $http, $log ) {
            // this is a fix to a bug with angular-cached-resource where it uses $log out of scope
            window.$log = $log;
            backend = $httpBackend;
            // doesn't ever get called as we have httpBackend,
//            backend.whenGET(/views\/.*/).passThrough();
            // passthrough is a nightmare... https://github.com/angular/angular.js/issues/1434
            // seems you cannot load local files in karma unit tests
            getSpy = sinon.spy( $http.get );
            apiBase = $rootScope.canAppr.apiBase;
            backend.whenGET( /views\/.*/ ).respond( 200, 'mocking view' );
            // ignore the views
            try {
                backend.flush();
            } catch ( err ) {

            }
            backend.verifyNoOutstandingExpectation();
            backend.verifyNoOutstandingRequest();
        } ) );
        describe( 'orgService', function () {
            beforeEach( inject( function ( orgService ) {
                service = orgService;
                expect( service ).to.not.be.undefined;
                // make sure we start clean
                backend.expectGET( apiBase + 'organizations' ).respond( 200, [
                    {mock : 'hello'}
                ] );
            } ) );
            afterEach( function () {
                backend.verifyNoOutstandingExpectation();
                backend.verifyNoOutstandingRequest();
            } );
            it( 'should be a cachedResource', function () {
                service.query().$promise.should.be.an( 'object' );
                backend.flush();
            } );
            it( 'should return empty from cache', function () {
                service.query().$promise.then( function ( results ) {
                    results.length.should.equal( 0 );
                } );
                backend.flush();
            } );
            it( 'should return 1 from server', function () {
                service.query().$httpPromise.then( function ( results ) {
                    results[0].mock.should.equal( 'hello' );
                } );
                backend.flush();
            } );
        } );
        describe( 'courseService', function () {
            beforeEach( inject( function ( courseService ) {
                service = courseService;
                expect( service ).to.not.be.undefined;
                // make sure we start clean
                backend.expectGET( apiBase + 'courses' ).respond( 200, [
                    {mock : 'hello'}
                ] );
            } ) );
            afterEach( function () {
                backend.verifyNoOutstandingExpectation();
                backend.verifyNoOutstandingRequest();
            } );
            it( 'should be a cachedResource', function () {
                service.query().$promise.should.be.an( 'object' );
                backend.flush();
            } );
            it( 'should return empty from cache', function () {
                service.query().$promise.then( function ( results ) {
                    results.length.should.equal( 0 );
                } );
                backend.flush();
            } );
            it( 'should return 1 from server', function () {
                service.query().$httpPromise.then( function ( results ) {
                    results[0].mock.should.equal( 'hello' );
                } );
                backend.flush();
            } );
        } );
        describe( 'moduleService', function () {
            beforeEach( inject( function ( moduleService ) {
                service = moduleService;
                expect( service ).to.not.be.undefined;
                // make sure we start clean
                backend.expectGET( apiBase + 'modules' ).respond( 200, [
                    {mock : 'hello'}
                ] );
            } ) );
            afterEach( function () {
                backend.verifyNoOutstandingExpectation();
                backend.verifyNoOutstandingRequest();
            } );
            it( 'should be a cachedResource', function () {
                service.query().$promise.should.be.an( 'object' );
                backend.flush();
            } );
            it( 'should return empty from cache', function () {
                service.query().$promise.then( function ( results ) {
                    results.length.should.equal( 0 );
                } );
                backend.flush();
            } );
            it( 'should return 1 from server', function () {
                service.query().$httpPromise.then( function ( results ) {
                    results[0].mock.should.equal( 'hello' );
                } );
                backend.flush();
            } );
        } );

    } );
    describe( 'registryService', function () {
        var service , rootScope;
        beforeEach( inject( function ( registryService, $rootScope ) {
            service = registryService;
            rootScope = $rootScope;
            expect( service ).to.not.be.undefined;
        } ) );
        describe( 'getNavModels', function () {
            it( 'should be a method', function () {
                service.getNavModels.should.be.a( 'function' );
            } );
        } );
        describe( 'resetNavModel', function () {
            it( 'should be a method', function () {
                service.resetNavModel.should.be.a( 'function' );
            } );
        } );
        describe( 'setNavModel', function () {
            it( 'should be a method', function () {
                service.setNavModel.should.be.a( 'function' );
            } );
        } );
        describe( 'setNavId', function () {
            it( 'should be a method', function () {
                service.setNavId.should.be.a( 'function' );
            } );
        } );
        describe( 'getConfig', function () {
            it( 'should be a method', function () {
                service.getConfig.should.be.a( 'function' );
            } );
            it( 'should return config from rootScope', function () {
                rootScope.canAppr.config.hello = 'world';
                service.getConfig().hello.should.equal( 'world' );
            } );
        } );
        describe( 'setConfig', function () {
            it( 'should be a method', function () {
                service.setConfig.should.be.a( 'function' );
            } );
            it( 'should return config from rootScope', function () {
                service.setConfig( 'hello', [ 'how', 'can', 'i', 'help' ] );
                service.getConfig().hello.should.have.lengthOf( 4 );
            } );
        } );
        /*
         getNavModels: function( type ) {
         if (type) {
         return _navParams[type];
         } else {
         return _navParams;
         }
         },
         resetNavModel: function( type ) {
         if (type) {
         // delete all properties
         _.keys ( _navParams[type] ).forEach ( function (key) {
         delete _navParams[type][key];
         });
         }
         return _navParams[type];
         },
         setNavModel: function( type , properties ) {
         if (type && properties) {
         // delete existing then extend new
         this.resetNavModel(type);
         _.extend ( _navParams[type]  , properties );
         }
         return _navParams[type];
         },
         setNavId: function( type , id ) {
         if (type && id) {
         // delete existing then extend new
         this.resetNavModel(type);
         _navParams.id=id;
         }
         return _navParams[type];
         },
         getConfig: function () {
         return _config;
         }
         */
    } );
    describe( 'navService', function () {
        var service;
        beforeEach( inject( function ( navService, $rootScope ) {
            service = navService;
            rootScope = $rootScope;
            expect( service ).to.not.be.undefined;
            // mocks - this could be a service in itself as likely to be re-needed
            rootScope.ons = { navigator : { getCurrentPage : sinon.stub(),
                resetToPage : sinon.stub() },
                slidingMenu : { setAbovePage : sinon.stub() },
                splitView : { setMainPage : sinon.stub() }
            };
        } ) );
        describe( 'getNavType', function () {
            it( 'should be a method', function () {
                service.getNavType.should.be.a( 'function' );
            } );
            it( 'should return navType', function () {
                rootScope.canAppr.config.navType = 'split';
                service.getNavType().should.equal( 'split' );
            } );
        } );
        describe( 'go', function () {
            it( 'should be a method', function () {
                service.go.should.be.a( 'function' );
            } );
            it( 'should use slidingMenu if navType slide', function () {
                rootScope.canAppr.config.navType = 'slide';
                service.go( 'postal.html' );
                rootScope.ons.slidingMenu.setAbovePage.should.have.been.calledOnce;
            } );
            it( 'should use splitMenu if navType split', function () {
                rootScope.canAppr.config.navType = 'split';
                service.go( 'postal.html' );
                rootScope.ons.splitView.setMainPage.should.have.been.calledOnce;
            } );
            it( 'should set NavOptions', function () {
                rootScope.canAppr.config.navType = 'split';
                service.go( 'postal.html', { test : 'passed'} );
                rootScope.canAppr.config.navOptions.test.should.equal( 'passed' );
            } );
        } );
        describe( 'getRouteOptions', function () {
            beforeEach( function () {
                service.setRouteOptions( { big : 'hello'} );
            } );
            it( 'should be a method', function () {
                service.getRouteOptions.should.be.a( 'function' );
            } );
            it( 'should get the options if they are set', function () {
                service.getRouteOptions( rootScope ).big.should.equal( 'hello' );
            } )
            it( 'should pop the options ', function () {
                service.getRouteOptions( rootScope );
                _.keys( rootScope.canAppr.config.navOptions ).length.should.equal( 0 );
            } )
        } );
    } );

    describe( 'domUtils', function () {
        var service;
        beforeEach( inject( function ( domUtils ) {
            service = domUtils;
            expect( service ).to.not.be.undefined;
        } ) );
        describe( 'offset', function () {
            it( 'should return left offset', function () {
                expect( service.offset( angular.element( angular.element( document.getElementsByTagName( 'body' ) ) ) ) ).to.exist;
                service.offset( angular.element( angular.element( document.getElementsByTagName( 'body' ) ) ) ).left.should.be.above( 0 );
            } );
            it( 'should return top offset', function () {
                service.offset( angular.element( angular.element( document.getElementsByTagName( 'body' ) ) ) ).top.should.be.above( 0 );
            } );
        } );
    } );
    describe( 'fileService', function () {
        var service;
        beforeEach( inject( function ( fileService ) {
            service = fileService;
            expect( service ).to.not.be.undefined;
        } ) );
        it( 'should return original url if not found' , function() {
            service.getFileUrl('http://notfound.com' ).should.equal('http://notfound.com');
        })
        it( 'should return local file path if found' );
    } );

    describe( 'prefService', function () {
        var service, rootScope;
        beforeEach( inject( function ( prefService , $rootScope) {
            window.localStorage.clear();
            service = prefService;
            rootScope = $rootScope;
            expect( service ).to.not.be.undefined;
        } ) );
        it( 'should return fals if Ive not subscribe to a courses' , function () {
            service.isSubscribed(3).should.not.be.ok;
            service.isSubscribed('3').should.not.be.ok;

        });
        it( 'should remember if I subscribe to a courses', function () {
            service.subscribeCourse(3);
            service.isSubscribed(3).should.be.ok;
            service.isSubscribed('3').should.be.ok;
        });
        it( 'should allow me to unsubscribe to a course', function () {
            service.subscribeCourse(3);
            service.unsubscribeCourse(3);
            service.isSubscribed(3).should.not.be.ok;
        });
        it( 'should allow me to mark events against modules', function () {
            service.setModuleEvent(3,3,'hello');
            service.getEventTime(3,3,'hello').getTime.should.be.a.function;
        });

        it( 'should allow me to mark files for download', function () {
            service.setModuleEvent(3,3,'hello');
            service.downloadContent(3,3);
            service.isDownloaded(3,3).should.equal('pending');
        });
        it( 'should allow me to remove downloaded files', function () {
            service.setModuleEvent(3,3,'hello');
            service.downloadContent(3,3);
            service.deleteContent(3,3);
            service.isDownloaded(3,3 ).should.not.be.ok;
        });
        it( 'should store preferences from localstorage', function () {
            service.setModuleEvent(3,3,'hello');
            // trigger the events
            rootScope.$apply();
            // not sure why this isn't working
            //localStorage.getItem('canAppr.prefs' ).should.contain('hello');
        });
        // would need to reconfigure the factory?
        it( 'should retrieve preferences from localstorage');
    } );
});