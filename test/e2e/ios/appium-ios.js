"use strict";
// This could probably be the same for both OS but with different environment variable to set config / page object?
// can see why they put device stuff in seperate files in their examples, which versions do we want to support
// more versions / resolutions = more complicated page objects
// SAUCE_USERNAME=daddysauce SAUCE_KEY=94e75bbd-cef6-46e7-9549-1315d4b36ee5 mocha test/e2e/ios/appium-ios.js

var wd = require("wd"),
    serverConfigs = require('./appium-servers' ),
    chai = require("chai" ),
    chaiAsPromised = require("chai-as-promised" ),
    expect,
    should,
    fs = require ('fs' ),
    ARTIFACT_DIR = process.env['ARTIFACT_DIR'] || process.env['CIRCLE_ARTIFACTS'],
    Q = require('q' ),
    HomePage = require ('./home-ios-appage' ),
    MainPage = require ('./main-ios-appage' ),
    ContentPage = require ('./content-ios-appage' ),
    MenuPage = require ('./menu-ios-appage' ),
    SLEEP_TIME = process.env.APPIUM_PAUSE || 1000;

chai.use(chaiAsPromised);
chaiAsPromised.transferPromiseness = wd.transferPromiseness;
expect = chai.expect;
should = chai.should();

describe("appium ios", function () {
    // set an extended timeout
    this.timeout(300000);
    var driver, home, main, content, menu,journeys={};

    function takeScreenshot (filename, next) {
        if ( ARTIFACT_DIR ) {
            filename = ARTIFACT_DIR + '/' + filename;
            var deferred = new Q.defer();
            driver.takeScreenshot().then( function ( img ) {
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
        } else {
            // return resolved promise
            return Q( true );
        }
    }

    before(function () {
        var serverConfig = ( process.env.SAUCE_USERNAME ) ? serverConfigs.sauce : serverConfigs.local;
        driver = wd.promiseChainRemote(serverConfig);
        if (process.env['DEBUG']) {
            require( "./logging" ).configure( driver );
        }
        // these should be a seperate file per environment as in the appium examples maybe using the dreaded node config!
        var desired = { browserName: '',
            'appium-version': '1.0',
            platformName: 'iOS',
            platformVersion: '7.1',
            deviceName: 'iPhone',
            app: '/Users/paulcook/levexis/canappr/phonegap/platforms/ios/build/emulator/Medit8.app' };
        home = new HomePage( driver );
        main = new MainPage( driver );
        content = new ContentPage(driver );
        menu = new MenuPage( driver );
        journeys.navToChimes = function () {
            return home.getButton().click()
                .then( function () {
                    return main.tapOn( 'Medit8 Sounds' ).then( function () {
                        return main.tapOn( 'Bells and bowls' ).then( function () {
                            return main.tapOn( 'Chimes' );
                        } );
                    } );
                } );
        };
        journeys.navToBells = function () {
            return home.getButton().click()
                .then( function () {
                    return main.tapOn( 'Medit8 Sounds' ).then( function () {
                        return main.tapOn( 'Bells and bowls' );
                    } );
                } );
        };
        return driver.init(desired);
    });
    after(function () {
        //return driver.sleep( SLEEP_TIME*2 ).quit();
    });
    afterEach(function () {
        return takeScreenshot('ios_' + new Date().getTime() );
    });
    it("should play/pause remote audio", function () {
        return expect(  journeys.navToChimes().then ( function () {
                return content.tapPlayPause()
                    .sleep( 1000 + SLEEP_TIME ).then ( function () {
                    return content.getRemainingSecs();
                });
        }) ).to.eventually.be.within( 0,9);
    });
    it("should allow you to skip audio", function () {
        return expect(  journeys.navToChimes().then ( function () {
            return content.tapPlayPause().then ( function () {
                return content.tapSeek( 100 ).then( function () {
                    return content.getRemainingSecs();
                });
            });
        })).to.eventually.equal( 0);
    });
    it("should download modules for subscribed courses", function () {
        return expect(  journeys.navToBells().then ( function () {
            return main.getSwitch().click().sleep( SLEEP_TIME ).then ( function () {
                // have problems with back button increasing total number of UI elements, need a more reliable way
                // possible a page offset check which cycles through elements until it finds the xpath for a certain element
                // and then offsets from that
                // look for both elements
                return menu.goHome().sleep( SLEEP_TIME ).elementByName('Medit8 Sounds - Bells and bowls').elementByName('Chimes');
            });
        })).to.be.ok;
    });
    it("should remove deleted modules", function () {
        return expect(  journeys.navToBells().then ( function () {
            // wait to download
            return main.getSwitch().click().sleep(SLEEP_TIME ).then ( function () {
                return main.tapOn( 'Chimes' ).then( function () {
                    return content.getSwitch().click().then( function () {
                        // Chimes should not be in list
                        // IS THIS PICKING UP ON HIDDEN MENU CHIMES?
                        return menu.goHome().sleep( SLEEP_TIME ).elementByName( 'Chimes' );
                    } );
                } );
            });
        }) ).to.eventually.be.rejected;
    });
    it("should allow deleted modules to be redownloaded", function () {
        return expect(  journeys.navToBells().then ( function () {
            // wait to download
            return main.getSwitch().click().sleep(SLEEP_TIME ).then ( function () {
                return main.tapOn( 'Chimes' ).then( function () {
                    return content.getSwitch().click().then( function () {
                        // Chimes should not be in list
                        return menu.goHome().then( function () {
                            return home.tapOn('Medit8 Sounds - Bells and bowls').then( function () {
                                return main.tapOn('Chimes' ).then( function () {
                                    // wait for redownload
                                    return content.getSwitch().click().sleep(SLEEP_TIME *2 ).then( function () {
                                        // Chimes should be back in list
                                        return menu.goHome().elementByName( 'Chimes' );
                                    } );
                                });
                            });
                        });
                    });
                });
            });
        }) ).to.eventually.be.ok;
    });
});