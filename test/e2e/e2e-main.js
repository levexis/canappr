var chai = require('chai' ),
    chaiAsPromised = require('chai-as-promised' ),
    MenuPage = require('./pages/menu-page' ),
    MainPage = require('./pages/main-page' ),
    fs = require ('fs' ),
    // set ARTIFACT_DIR for snapshots
    ARTIFACT_DIR = process.env['ARTIFACT_DIR'],
    Q = require('q');

// do I need this?
//require("mocha-as-promised")();

chai.use(chaiAsPromised);
var expect = chai.expect;

// should we set the API url here? Maybe configure the factory?
logIt = function (message) {
    console.trace(message);
};
// takes a screenshot, optional filename and next

// returns promise resolved on screenshot
function takeScreenshot (filename, next) {
    if ( ARTIFACT_DIR ) {
        filename = filename || "webdriver_error.png";
        filename = ARTIFACT_DIR + filename;
        var deferred = new Q.defer();
        browser.takeScreenshot().then( function ( img ) {
            console.log( 'see [' + filename + '] for screenshot' );
            fs.writeFileSync( filename, new Buffer( img, 'base64' ) );
            if ( typeof next === 'function' ) {
                next( 'filename' );
                // promise
            } else if ( typeof next === 'object' && typeof next.resolve === 'function' ) {
                next.resolve( filename );
            }
            deferred.resolve();
        } );
        return deferred.promise;
    }
}
// make the directory for screentshots
if ( ARTIFACT_DIR ) {
    try {
        fs.mkdirSync( ARTIFACT_DIR );
    } catch ( e ) {
        if ( e.code != 'EEXIST' ) throw e;
    }
}
describe('main', function () {
    describe ('Page Objects', function() {
        var menu,main,deferred;
        beforeEach( function () {
            // don't you just love opensource, fix to protractor phantomjs bug https://github.com/angular/protractor/issues/686
            browser.ignoreSynchronization = true;
            main = new MainPage();
            menu = new MenuPage();
            deferred = Q.defer();
            return main.get();
        } );
        afterEach( function () {
            browser.ignoreSynchronization = false;
            return takeScreenshot('test_' + new Date().getTime() );
        } );
        it( 'should create a valid menu', function () {
            return Q.all([
            expect( menu.list.count() ).to.eventually.equal( 4 ),
            expect( menu.list.get( 0 ).getText() ).to.eventually.contain( 'Medit8' ),
            expect( menu.getHome().getText() ).to.eventually.contain( 'Medit8' ),
            expect( menu.getOrg().getText() ).to.eventually.contain( 'Organizations' ),
            expect( menu.getCourse().getText() ).to.eventually.equal( '' ),
            expect( menu.getModule().getText() ).to.eventually.equal( '' ),
            expect( menu.getList() ).to.eventually.have.length( 4 )])
        } );
        it( 'should create a valid main page', function () {
            return Q.all([
                expect( main.getTitle().getText() ).to.eventually.contain( 'Organizations' ),
                expect( main.getDescription().getInnerHtml() ).to.eventually.contain( 'Welcome' ),
                expect( main.getListTitleText() ).to.eventually.contain( 'Organizations' ),
                expect( main.getList() ).to.eventually.have.length( 2 ).then(
                    function ( list) {
                    expect (list[0].getText() ).to.eventually.contain('Triratna East Surrey');
                })
            ]);
        } );
        it( 'should navigate to correct course use clickTo', function () {
            return expect( main.clickOn( 'surrey' )
                .then( function ( what ) {
                    return main.clickOn( 'meditation' );
                } ) )
                .to.eventually.equal( 'meditation' );
            /* does not work yet see test-promise for syntax
             return expect( main.clickOn( 'surrey' )
             .clickOn( 'meditation' )
             .getTitle().getText() )
             .to.eventually.equal( 'meditation' );
             */
            /* this will work
             return expect( main.clickOn( 'surrey' )
             .then( function(what) {
             console.log ('firstClick',what);
             return main.clickOn( 'meditation' ); }) )
             .to.eventually.equal( 'meditation' );
             main.clickOn( 'surrey' )
             .then( function(what) {
             console.log( 'firstClick', what );
             main.clickOn( 'meditation' ).then( function ( what ) {
             console.log( 'secondClick', what );
             deferred.resolve( what );
             } )
             });
             return expect( deferred.promise ).to.eventually.equal('meditation');
             */
        });

        it( 'should navigate using navTo Macro', function () {
            return expect( main.navTo( { organizations : 'surrey', courses : 'meditation' } ) )
                .to.eventually.contain( 'modules' )
        });

        // should say navto
        it( 'should return blank if no list title on page navigatedTo', function () {
            return expect ( main.navTo ( { organizations: 'surrey', courses: 'meditation', modules: 'breath' } ) )
                .to.eventually.equal( '' );

        });

        it( 'should return blank if navTo params misspelled');
        it( 'should return blank if clickTo not found');
        it( 'should allow me to chain methods without then');

    });
    describe ('Stories', function() {

         it('should start with an intro to the app');
/*
         , function () {
         // don't you just love opensource, fix to protractor phantomjs bug https://github.com/angular/protractor/issues/686
         browser.ignoreSynchronization = true;
         browser.get('index.html');
         expect (element(by.tagName('h1')).getText() ).to.eventually.contain('Medit8');
         browser.ignoreSynchronization = false;
         }); */
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