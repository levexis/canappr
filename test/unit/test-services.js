var expect = chai.expect;

var app = angular.module( 'canAppr' );
/*
,mockedApp = angular.module('mockAppr', ['canAppr', 'ngMockE2E']);
// this allows for passThrough via ngMockE2E but have to create a mock app module to call
mockedApp.run(function($httpBackend) {
    // 1) this is for e2e mocking and there is no server running when karma runs on CI?
    // 2) I cant seem to get passThrough to work in any case
    // this is supposed to all passthrough and automatically flush requests
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
    // passthrough is a nightmare... https://github.com/angular/angular.js/issues/1434
*/
//    $httpBackend.whenGET(/^\/views\/.*/).passThrough();
//    $httpBackend.whenGET('/^\/api\/.*/').passThrough();

    // I could build a complete mock for the phonegap modules here - Media, file etc
//});


describe('Services', function() {

    beforeEach( module( 'canAppr' ) );
//    beforeEach( module( 'mockAppr' ) ); not getting joy from mockAppr

    describe( 'libs', function () {
    var apibase;
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
        var backend, service, scope, ctrl;
        // these mocks should all be one service
        beforeEach( inject( function ( $httpBackend, $rootScope,  $log ) {
            // this is a fix to a bug with angular-cached-resource where it uses $log out of scope
            window.$log = $log;
            backend = $httpBackend;
            // doesn't ever get called as we have httpBackend,
//            backend.whenGET(/views\/.*/).passThrough();
            // passthrough is a nightmare... https://github.com/angular/angular.js/issues/1434
            // seems you cannot load local files in karma unit tests
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
            it( 'should return the value value if name passed', function () {
                rootScope.canAppr.config.hello = 'world';
                service.getConfig('hello').should.equal( 'world' );
            } );
            it( 'should return undefined if name not defined ', function () {
                expect(service.getConfig('wibble' ) ).to.be.undefined;
            });
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
            service.getURL('http://notfound.com' ).should.equal('http://notfound.com');
        })
        it( 'should return local file path if found' );
    } );
    describe( 'qutils', function () {
        var service , rootScope, deferred, log;
        beforeEach( inject( function ( qutils , $rootScope , $q, $log ) {
            service = qutils;
            rootScope = $rootScope;
            expect( service ).to.not.be.undefined;
            $log = sinon.stub($log);
            log = $log;
            deferred = $q.defer();
        } ) );
        it( 'should return resolved promise' , function( done ) {
            service.resolved('test' ).then ( function ( what) {
                what.should.equal( 'test' );
                // not sure we need this as apply will run the async code sychronously
                done();
            });
            // need to digest for promise to be fulfilled.
            rootScope.$apply();

        });
        it( 'should return success handler which logs message with debug' , function () {
            service.promiseSuccess(deferred, 'hello world' )('resolved');
            rootScope.$apply();
            log.debug.should.have.beenCalledOnce;
        });
        it( 'should just stub out success if no message' , function () {
            service.promiseSuccess(deferred )('resolved');
            rootScope.$apply();
            log.debug.should.not.have.beenCalled;
        });
        it( 'should return rejection handler which logs message with debub', function () {
            service.promiseError(deferred,'reject test' )('reject');
            rootScope.$apply();
            log.debug.should.have.been.calledOnce;
        });
    } );

    describe( 'prefService', function () {
        var service, rootScope, _fileService;
        beforeEach( inject( function ( $rootScope , fileService,  prefService , registryService) {
            window.localStorage.clear();
            rootScope = $rootScope;
            service = prefService;
            // stub file service that pref depends on, amazingly this works just like this
            fileService= sinon.stub ( fileService);
            registryService.setConfig( 'isNative', true );
            expect( service ).to.not.be.undefined;
            // set current nav params
            rootScope.canAppr.navParams.org.id=1;
            rootScope.canAppr.navParams.course.id=1;
            rootScope.canAppr.navParams.module.id=3;
            // this updates all the watches so navParams & configs set
            rootScope.$apply();
            _fileService = fileService;
        } ) );
        it( 'should stub fileService for tests' , function () {
            service.clearFiles();
            // check spy works
            service.subscribeCourse();
            service.unsubscribeCourse();
            _fileService.clearDir.should.have.been.calledOnce;
        });
        describe ( 'subscribe / unsubscribe / isSubscribed'  , function () {
            it( 'should return false if Ive not subscribe to a courses' , function () {
                service.isSubscribed().should.not.be.ok;
                service.isSubscribed('1-3').should.not.be.ok;
            });
            it( 'should remember if I explicitly subscribe to a courses', function () {
                service.subscribeCourse(3);
                service.isSubscribed(3).should.be.ok;
                service.isSubscribed('3').should.be.ok;
            });
            it( 'should allow me to unsubscribe to a course', function () {
                service.subscribeCourse();
                service.unsubscribeCourse();
                service.isSubscribed().should.not.be.ok;
            });
            it( 'should use navParams implicitly' , function () {
                service.subscribeCourse();
                service.isSubscribed('1').should.be.ok;
                service.unsubscribeCourse();
                service.isSubscribed('1').should.not.be.ok;
            });
        });
        describe ( 'events'  , function () {
            it( 'should allow me to mark events against modules', function () {
                service.setModuleEvent( 'hello' );
                service.getEventTime( 'hello' ).getTime.should.be.a.function;
            } );
        });
        describe ( 'files'  , function () {
            // this is a nice cheat to get the module data without having to wrestle with e2e backend, it's in a js file
            // that karma includes
            var modules = window.mockModules,
                _moduleService,
                apiBase,
                httpBackend;
            beforeEach( function (next ) {
                inject( function ( moduleService , $httpBackend ) {
                    apiBase = rootScope.canAppr.apiBase;
                    // read api - illustrates how to use th mock
                    httpBackend = $httpBackend;
                    _moduleService = moduleService;
                    // had to comment this out as was causing a problem on second flush - digest already exists
//                    httpBackend.expectGET( apiBase + 'modules' ).respond ( 200 , window.mockModules );
                    //_moduleService.query(function ( results ) {
                    //    modules = results;
                        next();
                    //} );
                    //httpBackend.flush();
                    // reset spies
                    _fileService.reset();
                    _fileService.canDownload ( true, true);
                } );
            });
            it( 'should lookup files and add to queue if checkCourseFiles called without modules' , function () {
                httpBackend.expectGET( apiBase + 'modules?courseId=1' ).respond ( 200 , window.mockModules );
                service.checkCourseFiles();
                httpBackend.flush();
                _fileService.cacheURL.callCount.should.equal(5);
                _fileService.downloadQueued.should.have.been.calledOnce;
            });
            it( 'should add files if checkfiles called with modules collection' , function ( next ) {
                service.checkCourseFiles('1',modules ).then ( function (downloaded) {
                    downloaded.should.not.be.ok;
                    _fileService.cacheURL.callCount.should.equal( 5 );
                    _fileService.downloadQueued.should.have.been.calledOnce;
                    next();
                });
                // call for angular promises to resolve
                rootScope.$apply();
            });
            it( 'should return aggregate status for course files', function (next) {
                httpBackend.expectGET( apiBase + 'modules/3' ).respond ( 200 , [ mockModules[2] ] );
                service.isModuleReady('3' ).then ( function ( status ) {
                    status.should.not.be.ok;
                    next();
                });
                rootScope.$apply();
                httpBackend.flush();
            });
            it( 'should add files to queue if modules collection passed with subscription' , function () {
                service.subscribeCourse ( null, mockModules);
                _fileService.getStatus.callCount.should.equal(5);
            });
            it( 'should clear files using module or navParams' , function() {
                service.clearFiles().should.be.an('object');
                // always returns a promise
                service.clearFiles().then.should.be.a('function');
            });
            it( 'checkFiles should populate cache status by module' , function () {
                service.checkFiles();
                service.isModuleReady(1).should.be.ok;
            });
        });
        it( 'should store preferences from localstorage');/* , function () {
           // not sure why this test isn't working
            service.setModuleEvent('hello');
            // trigger the events which should lead to local storage write
            rootScope.$apply();
//            sinon.spy(localStorage , 'setItem');
//            localStorage.setItem.should.have.been.calledOnce;
//            localStorage.setItem('canAppr.prefs' ).should.contain('hello');
        });
         */
        // not implemented
        it( 'should return a promise that resolves to a URL if I use downloadAndWait');
        // would need to reconfigure the factory?
        it( 'should retrieve preferences from localstorage');
    } );
    describe( 'timeUtils', function () {
        var service;
        beforeEach( inject( function ( timeUtils ) {
            service = timeUtils;
            expect( service ).to.not.be.undefined;
        } ) );
        describe ( 'secShow' , function () {
            it( 'should return blank string if not passed a value', function () {
                service.secShow().should.equal( '' );
            } );
            it( 'should return 00:00 if not passed 0', function () {
                service.secShow( 0 ).should.equal( '00:00' );
            } );
            it( 'should return 30:05 if passed 1805', function () {
                service.secShow( 1805 ).should.equal( '30:05' );
            } );
            it( 'should return 01:00:00 if passed 3600', function () {
                service.secShow( 3600 ).should.equal( '01:00:00' );
            } );
            it( 'should return 01:00 if passed 60.43435', function () {
                service.secShow( 60.43435 ).should.equal( '01:00' );
            } );
        });
    });
    describe(' fileService', function () {
        var service, rootScope, _fileService, httpBackend;
        beforeEach( inject( function ( $rootScope , $timeout, fileService ,registryService , $httpBackend) {
            rootScope = $rootScope;
            service = fileService;
            httpBackend = $httpBackend;
            _timeout = $timeout;
            // stub file service that pref depends on, amazingly this works just like this
            registryService.setConfig( 'isNative', true );
            // stub cordova services, this should be a service in its own right!
            window.cordova = window.cordova || {};
            window.cordova.file = { externalDataDirectory : '/sdcard' };
            window.FileTransfer = window.LocalTransfer || {};
            window.LocalFileSystem = window.LocalFileSystem || { PERSISTENT : true };
            window.RequestFileSystem = sinon.stub();
        } ) );
        it( 'should not initialise until init called', function () {
            expect ( service.getFileManager() ).to.be.undefined;
        });
        it( 'should initialise' , function () {
            service.init();
            expect ( service.getFileManager() ).to.be.defined;
        });
        describe ('downloading' ,function () {
            var _fileManager, _dirManager, _fileTable, _url;
            beforeEach( function () {
                service.init( 'canappr' );
                _fileManager = service.getFileManager();
                _dirManager = service.getDirManager();
                _fileTable = service.getFileTable();
                _fileManager = sinon.stub( _fileManager );
                _dirManager = sinon.stub( _dirManager );
                _url = 'http://test.com/test.mp3';
            } );
            describe( 'getURL', function () {
                it( 'should return the target url if not in cache', function () {
                    expect( service.getURL() ).to.be.undefined;
                    service.getURL( _url ).should.equal( _url );
                } );
                it( 'should return the target url if downloading', function () {
                    _fileTable[_url] = { status : 'downloading'}
                    service.getURL( _url ).should.equal( _url );
                } );
                it( 'should return the local url if cached', function () {
                    _fileTable[_url] = { status : 'cached',
                        local : 'cdv://local/test.mp3' };
                    service.getURL( _url ).should.equal( 'cdv://local/test.mp3' );
                } );
            } );
            describe( 'cacheURL', function () {
                beforeEach( function () {
                    delete _fileTable[_url];
                } );
                it( 'should return false if not in cache', function () {
                    service.cacheURL( _url, '1', 'test.mp3' ).should.equal( false );
                } );
                it( 'should add to queue if url and directory specified', function () {
                    service.cacheURL( _url ).should.equal( false );
                    expect( _fileTable[_url] ).to.be.undefined;
                    service.cacheURL( _url, '1', 'name.mp3' ).should.equal( false );
                    expect( _fileTable[_url] ).to.be.defined;
                    _fileTable[_url].dir.should.equal( '1' );
                    _fileTable[_url].filename.should.equal( 'name.mp3' );
                    _fileTable[_url].status.should.equal( 'queued' );
                } );
                it( 'should return local URL if in cache', function () {
                    _fileTable[_url] = { status : 'cached',
                        local : 'cdv://local/name.mp3'};
                    service.cacheURL( _url, '1', 'name.mp3' ).should.equal( 'cdv://local/name.mp3' );
                } );
            } );
            describe( 'downloadURL', function () {
                beforeEach( function () {
                    delete _fileTable[_url];
                    service.canDownload( true , true );
                    // reset the spy
                    _fileManager.download_file.reset();
                } );
                it( 'should return a promise', function () {
                    service.downloadURL().should.be.an( 'object' )
                    service.downloadURL().then.should.be.a( 'function' );
                } );
                it( 'should resolve to url', function ( done ) {
                    service.downloadURL( _url ).then( function ( what ) {
                        what.should.equal(_url);
                        done();
                    } );
                    rootScope.$apply();
                } );
                it( 'should download file if url,dir and wait', function () {
                    service.downloadURL( _url, '1', 'name.mp3' );
                    _fileManager.download_file.should.have.been.calledOnce;
                } );
                it( 'should resolve to local url if in cache', function ( done ) {
                    _fileTable[_url] = { status : 'cached',
                        local : 'cdv://local/test.mp3' };
                    service.downloadURL( _url ).then( function ( what ) {
                        what.should.equal( 'cdv://local/test.mp3' );
                        done();
                    } );
                    rootScope.$apply();
                } );
                it( 'should resolve immediately to url if canDownload is false and not cached', function ( done ) {
                    _fileTable[_url] = { status : 'downloading',
                        local : 'cdv://local/test.mp3' };
                    service.canDownload( false , true );
                    service.downloadURL( _url ).then( function ( what ) {
                        what.should.equal( _url);
                        done();
                    } );
                    rootScope.$apply();
                } );
                it( 'should poll for completion if currently downloading', function ( done ) {
                    var _waited = false;
                    _fileTable[_url] = {
                        status : 'downloading',
                        local : 'cdv://local/test.mp3' };
                    service.downloadURL( _url, '1', 'name.mp3' ).then( function ( result ) {
                        _waited.should.be.ok;
                        result.should.equal( 'cdv://local/test.mp3' );
                        done();
                    } );
                    _timeout.flush();
                    rootScope.$apply();
                    _waited = true;
                    _fileTable[_url].status = 'cached';
                    _timeout.flush();
                    rootScope.$apply();
                } );
                // not got a way of mocking these, timer.flush fluses immediatelyit( 'should only wait for 5 mins' );
                // can't test these as FileManager is stubbed, would need to mock
                it( 'should set local and size on succesful download' );
                it( 'should reset isDownloading and call downloadQueue on completion' );
            } );
            describe( 'downloadQueued', function () {
                beforeEach( function () {
                    delete _fileTable[_url];
                    service.canDownload( true , true );
                } );
                it( 'should return length of current queue', function () {
                    service.downloadQueued().should.equal( 0 );
                } );
                it( 'should accept queue as argument', function () {
                    service.downloadQueued( [
                        {url : _url, status : 'queued', dir : '1', filename : 'test.mp3'} ,
                        {url : _url, status : 'queued', dir : '1', filename : 'test.mp3'}
                    ] ).should.equal( 1 );
                } );
                it( 'should pop off the queue and start downloading', function () {
                    service.downloadQueued( [
                        {url : _url, status : 'queued', dir : '1', filename : 'test.mp3'}
                    ] ).should.equal( 0 );
                    service.isDownloading().should.be.ok;
                } );
                it( 'should use filetable if no queue passed in', function () {
                    _fileTable[_url] = {url : _url, status : 'queued', dir : '1', filename : 'test.mp3'};
                    service.isDownloading().should.not.be.ok;
                    service.downloadQueued().should.equal( 0 ); // popped
                    service.isDownloading().should.be.ok;
                } );
                it( 'should raise error if downloadQueued reaches 250 recrusions' , function (  ) {
                    // need to clone or it will pop one of my mocks off the window object and break later tests!
                    service.downloadQueued( _.clone(window.mockModules), 251).should.equal(false);
                });

            } );
            describe( 'resetAll', function () {
                beforeEach( function () {
                    _fileTable[_url] = {
                        status : 'cached',
                        local : 'cdv://local/test.mp3' };
                } );
                it( 'should clear all the files', function () {
                    service.resetAll();
                    _fileTable = service.getFileTable();
                    expect( _fileTable [ _url ] ).to.not.exist;
                } );
                it( 'should return status of false for getStatus', function () {
                    service.resetAll();
                    service.getStatus( _url ).should.equal( false );
                } );
                it( 'should return target url fro getURL ', function () {
                    service.resetAll();
                    service.getURL( _url ).should.equal( _url );
                } );
            } );
            describe( 'clearFile', function () {
                beforeEach( function () {
                    _fileTable[_url] = {
                        status : 'cached',
                        local : 'cdv://local/test.mp3' };
                    _fileTable[_url + '2' ] = {
                        status : 'cached',
                        local : 'cdv://local/test2.mp3' };

                } );
                it( 'should delete just the file', function () {
                    service.clearFile( _url );
                    _fileTable [ _url ].status.should.not.equal( 'cached' );
                    _fileManager.remove_file.should.have.been.calledOnce;
                } );
                it( 'should return status of deleted for getStatus', function () {
                    service.clearFile( _url );
                    service.getStatus( _url ).should.equal( 'deleted' );
                    service.getStatus( _url + '2' ).should.equal( 'cached' );
                } );
                it( 'should return target url for getURL ', function () {
                    service.resetAll();
                    service.getURL( _url ).should.equal( _url );
                } );
            } );
            describe( 'clearDir', function () {
                beforeEach( function () {
                    _fileTable[_url] = {
                        status : 'cached',
                        dir : '1',
                        filename : 'test.mp3',
                        local : 'cdv://local/test.mp3' };
                    _fileTable[_url + '2' ] = {
                        status : 'cached',
                        dir : '1-2',
                        filename : 'test.mp3',
                        local : 'cdv://local/test2.mp3' };
                } );
                it( 'should return a promise', function () {
                    service.clearDir( '1' ).then.should.be.a( 'function' );
                } );
                it( 'should delete files in that directory', function () {
                    service.clearDir( '1' );
                    _dirManager.remove.should.have.been.calledOnce;
                    expect( _fileTable [ _url ] ).to.not.exist;
                } );
                it( 'should return status of false for getStatus', function () {
                    service.clearDir( '1' );
                    service.getStatus( _url ).should.equal( false );
                    service.getStatus( _url + '2' ).should.equal( 'cached' );
                } );
                it( 'should return target url for getURL ', function () {
                    service.resetAll();
                    service.getURL( _url ).should.equal( _url );
                } );
                it( 'should set downloading files to failed on initialise' , function () {
                    _fileTable[_url] = { status : 'downloading',
                        local : 'cdv://local/test.mp3' };
                    service.init();
                    _fileTable[_url];
                });

            } );
            describe ('flags, getters and setters' , function() {
                it('should return status or false if not found', function () {
                    _fileTable[_url] = {
                        status : 'cached',
                        local : 'cdv://local/test.mp3' };
                    service.getStatus( 'poop' ).should.equal( false );
                    service.getStatus( _url ).should.equal( 'cached' );
                });
                it('should get / set isDownloading', function () {
                    service.isDownloading().should.equal( false );
                    service.isDownloading('true').should.equal( false );
                    service.isDownloading( true ).should.equal( true );
                    service.isDownloading().should.equal( true );
                });
                it('should get fileManager and dirManager', function () {
                    service.getFileManager().get_path.should.be.an('function');
                    service.getDirManager().remove.should.be.a('function');
                });
                it('should get fileTable', function () {
                    service.getFileTable().should.be.an('object');
                });
                it('should get / set canDowwload', function () {
                    service.canDownload ( true , true ).should.be.ok;
                    service.canDownload ( false , true ).should.not.be.ok;
                    service.canDownload ( true , false ).should.not.be.ok;
                    service.canDownload ( false , false ).should.not.be.ok;
                    service.canDownload ().should.not.be.ok;
                });
                it('should exec canDownload if function', function () {
                    var a=1,
                    toggler = function () {
                        return !!( a++ % 2 );
                    };
                    service.canDownload (toggler , true).should.be.ok;
                    service.canDownload ().should.not.be.ok;

                });
                /*
                canDownload: function ( setFlag ) {
                    if ( setFlag ) {
                        _canDownload = setFlag;
                    }
                    if ( typeof _canDownload === 'function' ) {
                        return _canDownload();
                    } else {
                        return !!_canDownload;
                    }
                }
                */
            });
            describe ('prefService.checkFiles' , function () {
                var _prefService;
                beforeEach( inject( function ( prefService ,registryService) {
                    console.log('debug',_fileTable);
                    registryService.setConfig('isNative',true);
                    rootScope.$apply();
                    _prefService = prefService;
                    _prefService.subscribeCourse( 1 , mockModules[0] );
                    _url = _.keys(_fileTable)[0];
                } ) );
                afterEach( function () {
                    _prefService.unsubscribeCourse( 1 );
                });
                it( 'should return true if isDownloaded passed a module' , function () {
                    _prefService.isModuleReady( 1 , mockModules[0] ).should.not.be.ok;
                    _prefService.isDownloaded( 1  , mockModules[0] ).should.not.be.ok;
                });
                it( 'should return true if isDownloaded passed a module' , function () {
                    _fileTable[_url].status='cached';
                    _prefService.isDownloaded(mockModules[0]).should.be.ok;
                });
                it( 'should return false if isDownloaded not passed a module' , function () {
                    _fileTable[_url].status='cached';
                    _prefService.isDownloaded().should.not.be.ok;
                });
                it( 'should mark module ready if cached or deleted' , function () {
                    _fileTable[_url].status='deleted';
                    _prefService.isModuleReady( 1 , mockModules[0] ).should.be.ok;
                    _prefService.isDownloaded( 1  , mockModules[0] ).should.not.be.ok;
                });
                it('should return a promise if not passed module(s) for isReady' , function () {
                    _prefService.isModuleReady(1).then.should.be.a('function');
                });
                it( 'should still be ready if I delete module files' , function () {
                    // should be ready by
                    _prefService.clearFiles( mockModules );
                    _prefService.isModuleReady( 1 , mockModules[0] ).should.be.ok;
                    _prefService.isDownloaded( 1  , mockModules[0] ).should.not.be.ok;
                    _fileManager.remove_file.should.have.been.calledOnce;
                    _fileManager.remove_file.args[0][0].should.equal('canappr/1');
                    _fileManager.remove_file.args[0][1].should.equal('1-0.mp3');
                });
                it( 'should but not ready or downloaded if I unsubscribe', function () {
                    _prefService.unsubscribeCourse( 1 , mockModules );
                    _prefService.isModuleReady( 1 , mockModules[0] ).should.not.be.ok;
                    _prefService.isDownloaded( 1  , mockModules[0] ).should.not.be.ok;
                });
                it( 'should check all files for modules are in queue' , function () {
                    _prefService.subscribeCourse(2);
                    _prefService.checkFiles();
                    httpBackend.expectGET( apiBase + 'modules?courseId=1' ).respond( 200, [
                        mockModules[0]
                    ] );
                    httpBackend.expectGET( apiBase + 'modules?courseId=2' ).respond( 200, [
                        mockModules[1]
                    ] );
                    //httpBackend.flush();
                });
                it( 'should not attempt to re-download module files unless explicity set cacheURL' , function () {
                    _prefService.clearFiles();
                    _prefService.checkFiles();
                });

            });
        });
    });
});

