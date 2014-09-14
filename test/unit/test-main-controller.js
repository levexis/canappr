var expect = chai.expect;
/* work in progress as soon as you run the digest loop this lot will blow with a ton of httpBackend expectation issues! */
describe('Main Controller', function () {

    beforeEach( module( 'canAppr' ) );

    describe( 'MainCtrl' , function () {
        var ctrl, scope, controller, _navService;
        beforeEach(   inject( function ( $rootScope, $controller , navService ) {
            // mocks - this could be a service in itself as likely to be re-needed
            $rootScope.ons = { navigator : { getCurrentPage : sinon.stub(),
                resetToPage : sinon.stub(),
                pushPage : sinon.stub() },
                slidingMenu : { setAbovePage : sinon.stub() },
                splitView : { setMainPage : sinon.stub() }
            };
            scope = $rootScope.$new();
            controller = $controller;
            ctrl = controller( "MainCtrl", {$scope : scope } );
            expect(ctrl).to.not.be.undefined;
            _navService = navService;
        }) );
        it ('should create $scope.collectionClass', function() {
            scope.collectionClass.should.exist;
        });
        it ('should load place holder / welcome text by default' , function () {
            scope.model.isPlaceholder.should.be.ok;
        });
        describe ( 'Organizations View' , function () {
            beforeEach(  function () {
                scope.options = { collection : 'org'};
                ctrl = controller( "MainCtrl", {$scope : scope } );
            });
            it ('should set collectionName to Organizations' , function () {
                scope.collectionName.should.equal ( 'Organizations');
                scope.target.should.equal ( 'course');
            });
            it ('should set collectionClass to fa-male' , function () {
                scope.collectionClass.should.equal ( 'fa-male');
            });
        });
        describe ( 'Course View' , function () {
            beforeEach(  function () {
                scope.options = { collection : 'course'};
                ctrl = controller( "MainCtrl", {$scope : scope } );
            });
            it ('should set collectionName to Courses' , function () {
                scope.collectionName.should.equal ( 'Courses');
                scope.target.should.equal ( 'module');
            });
            it ('should set collectionClass to fa-book' , function () {
                scope.collectionClass.should.equal ( 'fa-book');
            });
        });
        describe ( 'Modules View' , function () {
            beforeEach( function () {
                scope.options = { collection : 'module'};
                ctrl = controller( "MainCtrl", {$scope : scope } );
            } );
            it( 'should set collectionName to Organizations', function () {
                scope.collectionName.should.equal( 'Modules' );
                scope.target.should.equal( 'content' );
            } );
            it( 'should set collectionClass to fa-terminal', function () {
                scope.collectionClass.should.equal( 'fa-terminal' );
            } );
            it( 'should set canSubscribe', function () {
                expect( scope.canSubscribe ).to.exist;
            } );
            it( 'should set subscribed', function () {
                expect( scope.subscribed ).to.exist;
            } );
            describe ( 'Subscribe Course' , function () {
                var _prefService;
                /* would need to mock API services and expectations, need as sort of API mocker object to use and share between tests */
                beforeEach ( inject( function ( prefService ) {
                    _prefService = prefService;
                    // set current nav params
                    rootScope.canAppr.navParams.org.id=1;
                    rootScope.canAppr.navParams.org.name='myorg';
                    rootScope.canAppr.navParams.course.id=1;
                    rootScope.canAppr.navParams.course.orgId=1;
                    rootScope.canAppr.navParams.course.name='mycourse';
                    rootScope.canAppr.navParams.module.id=3;
                }));
                it ('should update preferences with subscribed module');
                it ('should add the modules to the course queue');
            });
        });
    });

});