// run with grunt e2e:dev , allows you to just run a single test as it.only not supported
var chai = require('chai' ),
    chaiAsPromised = require('chai-as-promised' ),
    MenuPage = require('../pages/menu-page' ),
    MainPage = require('../pages/main-page' ),
    HomePage = require('../pages/home-page' ),
    ContentPage = require('../pages/content-page' ),
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
        var menu,main,home,content,deferred,testPromise,journeys={};
        beforeEach( function () {
            browser.ignoreSynchronization = true;
            main = new MainPage();
            home = new HomePage();
            menu = new MenuPage();
            content = new ContentPage();
            deferred = Q.defer();
            // probably won't need to use this provided each nested function returns the next promise explicitly
            testPromise = deferred.promise;
            // could create a macro out of these?
            journeys.subscribeMeditation = function () {
                return main.get().then( function () {
                    main.navTo( { organizations : 'surrey', courses : 'meditation' } )
                        .then( function () {
                            return main.getSubscribe().click();
                        } );
                } );
            };
        } );
        it( 'should allow a user to play module content without subscribing or downloading' , function () {
            main.get();
            return expect (
                main.navTo ( { organizations: 'medit8', courses: 'bowls', modules: 'singing' } )
                    .then( function () {
//                        var content = new ContentPage();
                        return content.getPlayPause().click().then(
                            function () {
                                return browser.sleep( 1000 ).then (
                                function () {
                                    return content.getRemaining();
                                });
                        });
                    }) ).to.eventually.be.within(1, 16);
        });
        it( 'should fetch the track time' , function () {
            main.get();
            return expect (
                main.navTo ( { organizations: 'medit8', courses: 'bowls', modules: 'singing' } )
                    .then( function () {
                            return content.getRemaining();
                        })).to.eventually.be.equal(17);
        });
        afterEach( function () {
            browser.ignoreSynchronization = false;
            return takeScreenshot('after_' + new Date().getTime() );
        } );


    });
});
