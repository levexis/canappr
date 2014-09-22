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
    MenuPage = require ('./menu-ios-appage' );

chai.use(chaiAsPromised);
chaiAsPromised.transferPromiseness = wd.transferPromiseness;
expect = chai.expect;
should = chai.should();

describe("appium ios", function () {
    this.timeout(300000);
    var driver, home, main, content, menu;
    var allPassed = true;

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
        return driver.init(desired);
    });
    after(function () {
        driver.quit();
    });

    afterEach(function () {
        // what is this about - was from appium inspector boiler plate
        allPassed = allPassed && this.currentTest.state === 'passed';
        return takeScreenshot('ios_' + new Date().getTime() );
    });
    it("should play/pause remote audio", function () {
        return expect(  home.getButton().click()
            .then ( function () {
            return main.tapOn( 'Medit8 Sounds' ).then ( function () {
                return main.tapOn( 'Bells and bowls' ). then ( function () {
                    return main.tapOn( 'Chimes' ). then ( function () {
                        return content.tapPlayPause()
                            .sleep( 2000 ).then ( function () {
                            return content.getRemainingSecs();
                        });
                    });
                });
            });
        } )).to.eventually.be.within( 0,9);
    });
    it("should allow you to skip audio");
    it("should download modules for subscribed courses");
    it("should download modules for subscribed courses");
/*
    it("should play back recording", function () {
        return driver
            .sleep(1000)
//            .execute('mobile: waitForPageLoad') // probably not much use but experimenting with http://appium.wikia.com/wiki/Mobile_Commands
            .elementByName("Get Started").click()
            .sleep(1000)
            .elementByName("Medit8 Sounds").click()
            .sleep(1000)
            .elementByName("Bells and bowls").click()
            .sleep(1000) // subscribe
            .elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIASwitch[1]").click()
            .sleep(1000)
            .elementByName("Chimes").click()
            .sleep(1000)
            // is it cos it's blank?
            .elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[19]").click()
            .sleep(1000)
            // skip forwards
            .execute("mobile: tap", [{ "tapCount": 1, "touchCount": 1, "duration": 0.1, "x": 177, "y": 264 }])
            //            .context('WEBVIEW_1')
            .sleep(10000)
            .sleep(1000) // delete it
            .elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIASwitch[1]").click()
            .sleep(1000) // go home

            .execute("mobile: swipe", [{ "touchCount": 1, "startX": 19, "startY": 441, "endX": 299, "endY": 447, "duration": 0.5 }])
            .sleep(1000) // go home
//            .elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[2]").click()
            .elementByName("Medit8").click()
            .sleep(999000);
    });
*/
});
