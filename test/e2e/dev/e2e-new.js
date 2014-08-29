var chai = require('chai' ),
    chaiAsPromised = require('chai-as-promised' ),
    MenuPage = require('../pages/menu-page' ),
    MainPage = require('../pages/main-page' ),
    HomePage = require('../pages/home-page' ),
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
// set the screensize - otherwise need to slide menu out
browser.driver.manage().window().setSize(800, 600);

// takes a screenshot, optional filename and next
// returns promise resolved on screenshot
function takeScreenshot (filename, next) {
    if ( ARTIFACT_DIR ) {
        filename = ARTIFACT_DIR + '/' + filename;
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
describe('e2e', function () {

    describe ('Stories', function() {
        var menu,main,home,deferred,testPromise;
        beforeEach( function () {
            browser.ignoreSynchronization = true;
            main = new MainPage();
            home = new HomePage();
            menu = new MenuPage();
            deferred = Q.defer();
            testPromise = deferred.promise;
        } );
        afterEach( function () {
            browser.ignoreSynchronization = false;
            return takeScreenshot('test_' + new Date().getTime() );
        } );
        it( 'should allow a user to subscribe to a course', function() {
            // could create a macro out of these?
            main.get();
            return expect( main.navTo ( { organizations: 'surrey', courses: 'meditation' } )
                .then( function () {
                    return main.getSubscribe().click().then(
                        function () {
                            return main.getSubscribe().getText();
                        } );
                } ) ).to.eventually.equal('true');
        });
    });
});
