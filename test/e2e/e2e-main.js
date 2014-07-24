var chai = require('chai' ),
    chaiAsPromised = require('chai-as-promised' ),
    MenuPage = require('./pages/menu-page' ),
    MainPage = require('./pages/main-page' ),
    Q = require('q');
// do I need this?
require("mocha-as-promised")();

chai.use(chaiAsPromised);
var expect = chai.expect;

// should we set the API url here? Maybe configure the factory?
logIt = function (message) {
    console.trace(message);
}

describe('main', function () {
    describe ('Page Objects', function() {
        beforeEach( function () {
            // don't you just love opensource, fix to protractor phantomjs bug https://github.com/angular/protractor/issues/686
            browser.ignoreSynchronization = true;
        } );
        afterEach( function () {
            browser.ignoreSynchronization = false;
        } );
        it( 'should create a valid menu', function () {
            var menu = new MenuPage();
            menu.get();
            expect( menu.list.count() ).to.eventually.equal( 4 );
            expect( menu.list.get( 0 ).getText() ).to.eventually.contain( 'Medit8' );
            expect( menu.getHome().getText() ).to.eventually.contain( 'Medit8' );
            expect( menu.getOrg().getText() ).to.eventually.contain( 'Organizations' );
            expect( menu.getCourse().getText() ).to.eventually.equal( '' );
            expect( menu.getModule().getText() ).to.eventually.equal( '' );
            expect( menu.getList() ).to.eventually.have.length( 4 );
        } );
        it( 'should create a valid main page', function () {
            var main = new MainPage();
            main.get();
            expect( main.getTitle().getText() ).to.eventually.contain( 'Organizations' );
            expect( main.getDescription().getInnerHtml() ).to.eventually.contain( 'Welcome' );
            expect( main.getListTitleText() ).to.eventually.contain( 'Organizations' );
            expect( main.getList() ).to.eventually.have.length( 2 ).then(
                function ( list) {
                expect (list[0].getText() ).to.eventually.contain('Triratna East Surrey');
            });
        } );
        it( 'should navigate to correct org', function () {
            var main = new MainPage();
            main.get();
//            expect ( main.navTo ( { organizations: 'surrey', courses: 'meditation', modules: 'breath' } ) )
//                .to.eventually.contain( 'Modules' );
            return Q(expect ( main.clickOn ( 'surrey' ) ).to.eventually.equal( 'surrey' ));
//            var defer = Q.defer();
//            setTimeout(function() {
//                defer.resolve(2);
//            }, 1000);

 //           return expect ( Q.defer().promise ).to.eventually.equal(4);
//            console.log ( 'q' , expect (defer.promise ) );
  //          console.log ( 'main' , expect (main.getList()) );

            /*            main.clickOn ( 'surrey' ).then( function ( message) {
                            console.log( message );
                        });
                        main.clickOn ( 'kent' ).then( function ( message) {
                            console.log( message );
                        });
             */

            // check the menu items
            // check they get reset if you choose a new org
        } );
        it( 'should navigate to correct course', function () {
            var main = new MainPage();
            main.get();
//            expect ( main.navTo ( { organizations: 'surrey', courses: 'meditation', modules: 'breath' } ) )
//                .to.eventually.contain( 'Modules' );
            return Q( expect( main.clickOn( 'surrey' )
                .then( function(what) { console.log ('firstClick',what); return Q(new MainPage().clickOn( 'meditation' )); } ) )
                .to.eventually.equal( 'meditation' ) );
//             return Q.all( [expect( main.clickOn( 'surrey' ) ).to.eventually.equal( 'surrey' ),
//                 expect( new MainPage().clickOn( 'meditation' ) ).to.eventually.equal( 'meditation' )
//             ]);
        });

    });
    describe ('Stories', function() {

/*
        it( 'should  keep a promise', function () {

//            expect ( main.navTo ( { organizations: 'surrey', courses: 'meditation', modules: 'breath' } ) )
//                .to.eventually.contain( 'Modules' );
//            expect ( main.clickOn ( 'surrey' ) ).to.eventually.equal( 'surreyz' );
            var defer = Q.defer();
            setTimeout( function () {
                defer.resolve( 2 );
            }, 1000 );

            return  Q(expect( defer.promise ).to.eventually.equal( 4 )) ;
//            expect( defer.promise ).to.eventually.equal( 4 ).notify(done);
        });
         it('should start with an intro to the app', function () {
         // don't you just love opensource, fix to protractor phantomjs bug https://github.com/angular/protractor/issues/686
         browser.ignoreSynchronization = true;
         browser.get('index.html');
         expect (element(by.tagName('h1')).getText() ).to.eventually.contain('Medit8');
         browser.ignoreSynchronization = false;
         });
        it( 'should allow me to select an organization' );
        it( 'should allow me to select a course' );
        it( 'should allow me to select a module' );
        it( 'should reset menu if I change organization or course' );


        it( 'should allow me to play module content' );
        it( 'should show enable new content' );
        it( 'should show allow users to remove watched content' );
        it( 'should show allow users to choose to autodownload' );
        it( 'should download current and next module content' );
        it( 'should notify when new module available' );
         */

    });
    /* an example using promises
    describe('the test suite', function() {
        it('uses promises properly', function() {
            var defer = Q.defer();
            setTimeout(function() {
                defer.resolve(2);
            }, 1000);
            return Q.all([
                Q(expect(defer.promise).to.eventually.equal(0))
            ]);
        });
    });
     */
});