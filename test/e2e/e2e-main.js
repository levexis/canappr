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
        it( 'should navigate to correct course use clickTo', function () {
            return expect( main.clickOn( 'surrey' )
                .then( function ( what ) {
                    return main.clickOn( 'meditation' );
                } ) )
                .to.eventually.equal( 'meditation' );
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
        it( 'should return blank if navTo params misspelled', function () {
            return expect ( main.navTo ( { organisations: 'surrey', couses: 'meditation', moduls: 'breath' } ) )
                .to.eventually.equal( 'organizations' );
        });
        it( 'should return blank if clickOn not found', function () {
            return ( main.clickOn ( 'plant pot' ) )
                .should.be.rejectedWith( 'unable to find plant pot' );
        });
        it( 'should allow me to chain methods without then' );
        /* does not work yet see test-promise for syntax
         return expect( main.clickOn( 'surrey' )
         .clickOn( 'meditation' )
         .getTitle().getText() )
         .to.eventually.equal( 'meditation' );
         */
    });
    describe ('Stories', function() {
        var menu,main,deferred;
        beforeEach( function () {
            browser.ignoreSynchronization = true;
            main = new MainPage();
            menu = new MenuPage();
            deferred = Q.defer();
        } );
        afterEach( function () {
            browser.ignoreSynchronization = false;
            return takeScreenshot('test_' + new Date().getTime() );
        } );
        it( 'should start with an intro to the app',function() {
            main.get();
            expect ( main.getDescription().getInnerHtml() ).to.eventually.contain('Welcome');
        });
        it( 'should allow me to select an organization from home list',function() {
            main.get();
            expect ( main.getListTitleText() ).to.eventually.contain('Organizations');
        });
        it( 'should allow me to select a course from orgs list' ,function() {
            main.get();
            expect ( main.navTo ( { organizations: 'surrey', courses: 'meditation' } )
                .then ( function ( what ) {
                return main.clickOn( 'meditation' );
            })
            ).to.eventually.contain('guided meditations');
        });
        it( 'should allow me to select a module from courses list',function() {
            main.get();
            expect ( main.navTo ( { organizations: 'surrey', courses: 'meditation' } )
                .then ( function ( what ) {
                return main.clickOn( 'breath' );
            })
            ).to.eventually.contain('awareness of breath meditation');

        });
        it( 'should reset menu if I change organization' , function() {
            // set the window size so you don't have to simulate swipe
            // https://github.com/angular/protractor/issues/201
            // browser.actions().mouseMove({x: 20, y: 0}).mouseMove({x: 20, y: 500}).perform()
            browser.driver.manage().window().setSize(800, 600);
            menu.get();
            return expect ( main.navTo ( { organizations: 'surrey', courses: 'meditation', modules: 'breath' } )
                    .then( function () {
                    menu.getOrg().click()
                        .then( function ( what ) {
                            console.log ( 'org clicked', what );
                            var main = new MainPage();
                            main.clickOn( 'now project' )
                                .then( function ( what ) {
                                    console.log ( 'now clicked', what ) ;
                                    return menu.getList().then ( function (list) {
                                        console.log ( 'extra cb',list,menu.list,list.length);
                                        return list;
                                    });
                                } );
                        } );
                })
            ).to.eventually.have.length( 2 );
        });
        it( 'should change menu label when I change course' , function() {
            browser.driver.manage().window().setSize(800, 600);
            menu.get();
            return expect ( main.navTo ( { organizations: 'surrey', courses: 'meditation', modules: 'breath' } )
                    .then( function () {
                        menu.getCourse().click()
                            .then( function ( what ) {
                                console.log ( 'course clicked', what );
                                main.clickOn ( 'liturgy' )
                                    .then( function ( what ) {
                                        console.log ( 'liturgy clicked', what ) ;
                                        menu.getCourse().getText().then( function (what) {
                                            console.log ('menu label' , what );
                                            return what;
                                        });
                                    } );
                            } );
                    })
            ).to.eventually.equal( 'triratna liturgy' );
        });
        it( 'should allow me to play module content' );
        it( 'should show enable new content' );
        it( 'should show allow users to remove watched content' );
        it( 'should show allow users to choose to autodownload' );
        it( 'should download current and next module content' );
        it( 'should notify when new module available' );

    });
});
