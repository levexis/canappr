var chai = require('chai' ),
    chaiAsPromised = require('chai-as-promised' ),
    MenuPage = require('./pages/menu-page' ),
    MainPage = require('./pages/main-page' ),
    fs = require ('fs' ),
    // set ARTIFACT_DIR for snapshots
    // eg ARTIFACT_DIR=test.
    ARTIFACT_DIR = process.env['ARTIFACT_DIR'] || process.env['CIRCLE_ARTIFACTS'],
    Q = require('q');

// do I need this?
//require("mocha-as-promised")();

chai.use(chaiAsPromised);
var expect = chai.expect,
    should = chai.should();

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
// make the directory for screentshot if local, if ci remaking this will destroy link to artifacts
if ( process.env['ARTIFACT_DIR'] ) {
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
            main.get();
            return browser.waitForAngular();
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

        it( 'should allow me to play module content' );
        it( 'should show enable new content' );
        it( 'should show allow users to remove watched content' );
        it( 'should show allow users to choose to autodownload' );
        it( 'should download current and next module content' );
        it( 'should notify when new module available' );

    });
});
