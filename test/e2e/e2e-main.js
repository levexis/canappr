var chai = require('chai' ),
    chaiAsPromised = require('chai-as-promised' ),
    MenuPage = require('./pages/menu-page' ),
    MainPage = require('./pages/main-page' ),
    HomePage = require('./pages/home-page' ),
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
            menu.get();
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
                // this really should be a check for blurb
                expect( main.getDescription().getInnerHtml() ).to.eventually.contain( 'Select an organization' ),
                expect( main.getListTitleText() ).to.eventually.contain( 'Organizations' ),
                expect( main.getList() ).to.eventually.have.length( 3 ).then(
                    function ( list) {
                        expect (list[0].getText() ).to.eventually.contain('Triratna East Surrey');
                    })
            ]);
        } );

        it( 'should navigate to correct course use clickOn', function () {
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
        var menu,main,home,deferred,testPromise, journeys={};
        beforeEach( function () {
            browser.ignoreSynchronization = true;
            main = new MainPage();
            home = new HomePage();
            menu = new MenuPage();
            deferred = Q.defer();
            testPromise = deferred.promise;
            journeys.subscribeMeditation = function () {
                return main.get().then( function () {
                    main.navTo( { organizations : 'surrey', courses : 'meditation' } )
                        .then( function () {
                            return main.getSwitch().click();
                        } );
                } );
            };
        } );
        afterEach( function () {
            browser.ignoreSynchronization = false;
            return takeScreenshot('test_' + new Date().getTime() );
        } );
        it( 'should start with an intro to the app',function() {
            home.get();
            expect ( home.getBlurb().getInnerHtml() ).to.eventually.contain('Welcome to Medit8');
        });
        it( 'should have a buuton to get started which takes me to the main list',function() {
            home.get();
            expect ( home.getBlurb().getInnerHtml() ).to.eventually.contain('Welcome to Medit8');
        });
        it( 'should allow me to select an organization from main list',function() {
            main.get();
            expect ( main.getListTitleText() ).to.eventually.contain('Organizations');
        });
        it( 'should allow me to select a course from org page' ,function() {
            main.get();
            expect ( main.navTo ( { organizations: 'surrey', courses: 'meditation' } )
                    .then ( function ( what ) {
                    return main.clickOn( 'meditation' );
                })
            ).to.eventually.contain('guided meditations');
        });
        it( 'should allow me to select a module from course page',function() {
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
//            browser.driver.manage().window().setSize(800, 600);
            /* this was failing as resolving to undefined
             // expect seems to resolve after getOrg even though console statements continue
             // could be due to mix of promise types or could be me being dumb about what is
             // being returned by this chain, fix is to be explicit about the promise
             -- it's probably what gets return by .click() that causese the problems
             return expect ( main.navTo ( { organizations: 'surrey', courses: 'meditation', modules: 'breath' } )
             .then( function () {
             menu.getOrg().click()
             .then( function ( what ) {
             console.log ( 'org clicked', what );
             var main = new MainPage();
             main.clickOn( 'now project' )
             .then( function ( what ) {
             console.log ( 'now clicked', what ) ;
             var menu = new MenuPage();
             return menu.getList().then ( function (list) {
             console.log ( 'extra cb',list.length,menu.list.length,list.length);
             return list;
             });
             } );
             } );
             })
             ).to.eventually.have.length( 2 );
             */
            main.get();
            main.navTo ( { organizations: 'surrey', courses: 'meditation', modules: 'breath' } )
                .then( function () {
                    menu.getOrg().click()
                        .then( function ( what ) {
                            var main = new MainPage();
                            main.clickOn( 'now project' )
                                .then( function ( what ) {
                                    var menu = new MenuPage();
                                    return menu.getCourse().getText().then ( deferred.resolve );
                                } );
                        } );
                });
            return testPromise.should.eventually.not.contain('Meditation');
        });
        it( 'should change menu label when I change course' , function() {
            main.get();
            main.navTo ( { organizations: 'surrey', courses: 'meditation', modules: 'breath' } )
                .then( function () {
                    menu.getCourse().click()
                        .then( function ( what ) {
                            main.clickOn ( 'liturgy' )
                                .then( function ( what ) {
                                    menu.getCourse().getText().then( deferred.resolve );
                                });
                        } );
                });
            return testPromise.should.eventually.contain( 'Triratna Liturgy' );
        });
        it( 'should show nothing available message if no list' ,function() {
            main.get();
            return expect( main.clickOn( 'now' )
                .then( function ( what ) {
                    return main.getListEmpty().getText();
                } ) )
                .to.eventually.contain( 'there are no' );
        });
        it( 'should allow a user to subscribe to a course', function() {
            return expect( journeys.subscribeMeditation().then(
                function () {
                    var main = new MainPage();
                    return main.getSwitch().getAttribute('checked');
                } ) ).to.eventually.equal('true');
        });
        it( 'should show subscribed course on homepage', function() {
            return expect( journeys.subscribeMeditation().then(
                function () {
                    menu = new MenuPage();
                    return menu.getHome().click().then ( function () {
                        home = new HomePage();
                        return home.getCourses().then( function (courses) {
                            return courses[0];
                        });
                    });
                }) ).to.eventually.contain('Triratna East Surrey - Guided Meditations');
        });
        it( 'should disable module delete switch until content has been downloaded', function () {
            main.get();
            return expect (
                main.navTo ( { organizations: 'surrey', courses: 'meditation', modules: 'breath' } )
                    .then( function () {
                        return main.getSwitch().isEnabled();
                    }) ).to.eventually.be.not.ok;
        });
        it( 'should show module as not downloaded when switch is set', function () {
            main.get();
            return expect (
                main.navTo ( { organizations: 'surrey', courses: 'meditation', modules: 'breath' } )
                    .then( function () {
                        return main.getSwitch().getAttribute('checked');
                    }) ).to.eventually.be.not.ok;
        });
        it( 'should allow a user to play module content without subscribing or downloading' );
        /*
         native tests / require appium
         it( 'should download current and next module content' );
         it( 'should show downloaded modules on homepage' );
         it( 'should show allow users to remove watched content' );
         */

        /* not implemented
         it( 'should notify when new module available' );
         it( 'should show enable new content once criteria met' );
         */
    });
});
