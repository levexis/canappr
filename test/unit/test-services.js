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
            it( 'should return the value value if name passed', function () {
                rootScope.canAppr.config.hello = 'world';
                service.getConfig('hello').should.equal( 'world' );
            } );
            it( 'should return false if name not defined ', function () {
                service.getConfig('wibble' ).should.equal(false);
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
            service.clearFiles('1-1');
            // check spy works
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
                service.isSubscribed('1-1').should.be.ok;
                service.unsubscribeCourse();
                service.isSubscribed('1-1').should.not.be.ok;
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
                inject( function ( moduleService , $httpBackend , $http ) {
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
                    _fileService.reset()
                } );
            });
            it( 'should lookup files and add to queue if checkFiles called without modules' , function () {
                httpBackend.expectGET( apiBase + 'modules?courseId=1' ).respond ( 200 , window.mockModules );
                service.checkFiles();
                httpBackend.flush();
                _fileService.cacheURL.callCount.should.equal(5);
                _fileService.downloadQueued.should.have.been.calledOnce;
            });
            it( 'should add files if checkfiles called with modules collection' , function ( next ) {
                service.checkFiles('1-1',modules ).then ( function (downloaded) {
                    downloaded.should.not.be.ok;
                    _fileService.cacheURL.callCount.should.equal( 5 );
                    _fileService.downloadQueued.should.have.been.calledOnce;
                    next();
                });
                // call for angular promises to resolve
                rootScope.$apply();
            });
            it( 'should return aggregate status for course files', function (next) {
                // http backend seems to insist the api returns a collection even for a single get!
                // otherwise I get a bad array error if I don't put the record in an array
                var response = JSON.stringify([ mockModules[2] ]);
                httpBackend.expectGET( apiBase + 'modules/3' ).respond ( 200 , response );
                service.getModuleStatus('1-1' ).then ( function ( status ) {
                    status.should.not.be.ok;
                    next();
                });
                rootScope.$apply();
                httpBackend.flush();
            });
            it( 'should add files to queue if modules collection passed with subscription');
            it( 'should allow mark module as downloaded if all files cached');
            it( 'should allow me to delete module files');
            it( 'should not attempt to redownload a deleted file unless explicity set to redownload');
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
        var service, rootScope, _fileService;
        beforeEach( inject( function ( $rootScope , $timeout, fileService ,registryService ) {
            rootScope = $rootScope;
            service = fileService;
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
            var _fileManager,_dirManager,_fileTable, _url;
            beforeEach ( function () {
                service.init('canappr');
                _fileManager = service.getFileManager();
                _dirManager = service.getDirManager();
                _fileTable = service.getFileTable();
                _fileManager = sinon.stub(_fileManager);
                _dirManager = sinon.stub(_dirManager);
                _url = 'http://test.com/test.mp3';
            });
            describe ('getURL' ,function () {
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
            });
            describe ('cacheURL' ,function () {
                beforeEach ( function () {
                    delete _fileTable[_url];
                });
                it('should return false if not in cache' , function () {
                    service.cacheURL( _url, '1-1','test.mp3' ).should.equal(false);
                });
                it('should add to queue if url and directory specified' , function () {
                    service.cacheURL( _url ).should.equal(false);
                    expect ( _fileTable[_url] ).to.be.undefined;
                    service.cacheURL( _url , '1-1' , 'name.mp3').should.equal(false);
                    expect (_fileTable[_url] ).to.be.defined;
                    _fileTable[_url].dir.should.equal('1-1');
                    _fileTable[_url].filename.should.equal('name.mp3');
                    _fileTable[_url].status.should.equal('queued');
                });
                it('should return local URL if in cache' , function () {
                    _fileTable[_url] = { status : 'cached',
                                local: 'cdv://local/name.mp3'};
                    service.cacheURL( _url , '1-1' , 'name.mp3').should.equal('cdv://local/name.mp3');
                });
            });
            describe ('downloadURL' , function () {
                beforeEach ( function () {
                    delete _fileTable[_url];
                    service.canDownload( true );
                    _fileManager.download_file.reset();
                });
                it('should return a promise' , function () {
                    service.downloadURL().should.be.an('object')
                    service.downloadURL().then.should.be.a('function');
                });
                it('should resolve to false if url,dir or name missing', function (done) {
                    service.downloadURL(_url).then( function ( what ) {
                        what.should.be.false;
                        done();
                    } );
                    rootScope.$apply();
                });
                it('should download file if url,dir and wait', function () {
                    service.downloadURL(_url , '1-1' , 'name.mp3');
                    _fileManager.download_file.should.have.been.calledOnce;
                });
                it('should resolve to local url if in cache', function (done) {
                    _fileTable[_url] = { status : 'cached',
                        local : 'cdv://local/test.mp3' };
                    service.downloadURL(_url).then( function ( what ) {
                        what.should.equal ('cdv://local/test.mp3');
                        done();
                    } );
                    rootScope.$apply();
                });
                it('should resolve immediately to false if canDownload is false and not cached', function (done) {
                    _fileTable[_url] = { status : 'downloading',
                        local : 'cdv://local/test.mp3' };
                    service.canDownload( false );
                    service.downloadURL(_url).then( function ( what ) {
                        what.should.be.false;
                        done();
                    } );
                    rootScope.$apply();
                });
                it('should poll for completion if currently downloading', function ( done ) {
                    var _waited = false;
                    _fileTable[_url] = {
                        status : 'downloading',
                        local : 'cdv://local/test.mp3' };
                    service.downloadURL(_url , '1-1' , 'name.mp3' ).then( function(result) {
                        _waited.should.be.ok;
                        result.should.equal( 'cdv://local/test.mp3' );
                        done();
                    });
                    _timeout.flush();
                    rootScope.$apply();
                    _waited=true;
                    _fileTable[_url].status = 'cached';
                    _timeout.flush();
                    rootScope.$apply();
                });
                it('should only wait for 5 mins'); // not got a way of mocking these
                // can't test these as FileManager is stubbed, would need to mock
                it('should set local and size on succesful download');
                it('should reset isDownloading and call downloadQueue on completion');

            })
            /*
            downloadURL : function ( url, dir , name) {
                var deferred,
                // manuel is our waiter
                    manuel,
                    startTime = new Date(),
                    _self = this;
                if ( url && _fileTable[url] && _fileTable[url].status === 'cached') {
                    return qutils.resolved(_fileTable[url].local );
                } else if ( url && dir && name && !_fileTable[url] || _fileTable[url] === 'deleted'  ) {
                    _fileTable[url] = {
                        status : 'downloading',
                        dir: dir,
                        filename: name
                    };
                    deferred = $q.defer();
                    _isDownloading = true;
                    _fileManager.download_file( url , APP_DIR + '/' + dir , name ,
                        function ( file ) {
                            $log.debug('created file',file);
                            _fileTable[url].status = 'cached';
                            //                            _fileTable[url].local = file.toNativeURL(); not in android need local url
                            // get the filesize, it's not actually a file that is returned!
                            file.file( function ( file ) {
                                // save in MB to 1 decimal place
                                _fileTable[url].local = file.localURL;
                                _fileTable[url].size = (file.size / 1000000 ).toFixed(1);
                                _saveTable();
                                deferred.resolve( file.localURL );
                                _isDownloading = false;
                                // always tries to download any other queued files
                                _self.downloadQueued();
                            });
                        },
                        function ( error) {
                            _fileTable[url].status='failed';
                            _saveTable();
                            deferred.reject( error );
                        });
                    return deferred.promise;
                } else if ( _fileTable[url] === 'downloading' ) {
                    // check every 10s and wait TODO should we time out? Need to be able to reset
                    startTime = new Date();
                    manuel = function (url) {
                        $timeout( function ( url ) {
                            if ( _fileTable[url].status === 'cached' ) {
                                deferred.resolve( _fileTable[url].local );
                            } else if ( _fileTable[url].status === 'failed' ) {
                                deferred.reject( 'download error' );
                                // give it 5 mins
                            } else if ( new Date().getTime - startTime > 300*1000 ) {
                                // could return the actual URL if online?
                                deferred.reject( 'timed out after ' + ( new Date().getTime - startTime) + 'ms ');
                            } else {
                                manuel(url);
                            }
                        }, 10000 );
                    };
                }
            },
            downloadQueued: function ( TBD ) {
                var queued = TBD,
                    next,
                    _self = this;
                if ( !_isDownloading ) {
                    if (!queued || !queued.length) {
                        queued = getFiles( 'status', 'queued' );
                        if ( !queued.length ) {
                            // retry failures
                            queued = getFiles( 'status', 'failed' );
                        }
                        if (queued.length) {
                            // should maybe do these in some sort of order, presume shift will be order they were put in
                            next = queued.shift();
                            this.downloadURL ( next.url, next.dir, next.filename)
                                .then( function () {
                                    _self.downloadQueued( queued );
                                });
                        }
                    }
                    return queued.length;
                }
            },
            clearAll : function () {
                _fileManager = {};
                _saveTable();
                return this.clearDir ('');
            },
            clearFile : function (url) {
                if (url && _fileTable[url].status === 'cached' ) {
                    var deferred = $q.defer();
                    _fileManager.remove_file( APP_DIR + '/' + _fileTable[url].dir,_fileTable[url].filename,
                        function ( success) {
                            _fileTable[url].status = 'deleted';
                            _fileTable.save();
                            qutils.promiseSuccess( deferred, url + ' cleared' )(success);
                        },
                        qutils.promiseError( deferred ) );
                    return deferred.promise;
                } else {
                    return qutils.resolved( false );
                }
            },
            clearDir : function (dir) {
                if (typeof dir === 'string') {
                    var deferred = $q.defer();
                    _dirManager.remove( APP_DIR + '/' + dir , qutils.promiseSuccess( deferred, dir + ' cleared' ), qutils.promiseError( deferred ) );
                    return deferred.promise;
                } else {
                    return qutils.resolved( false );
                }
            },
            getStatus  : function (url) {
                if ( url && _fileTable[url] ) {
                    return _fileTable[url].status;
                } else {
                    return false;
                }
            },
            isDownloading: function (isDownloading) {
                if ( typeof isDownloading === 'boolean' ) {
                    _isDownloading = isDownloading;
                }
                return _isDownloading;
            },
            getFileManager: function () {
                return _fileManager;
            },
            getDirManager: function () {
                return _dirManager;
            },
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
            getFileTable
            */
        });
    });
});

