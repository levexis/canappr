"use strict";

require("./helpers/setup");

var wd = require("wd"),
    _ = require('underscore'),
    serverConfigs = require('./helpers/appium-servers' ),
    chai = require("chai" ),
    chaiAsPromised = require("chai-as-promised" ),
    fs = require ('fs' ),
// set ARTIFACT_DIR for snapshots
// eg ARTIFACT_DIR=test.
    ARTIFACT_DIR = process.env['ARTIFACT_DIR'] || process.env['CIRCLE_ARTIFACTS'] || 'artifacts',
    Q = require('q');

chai.use(chaiAsPromised);
chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

describe("ios simple", function () {
    this.timeout(300000);
    var driver;
    var allPassed = true;
// takes a screenshot, optional filename and next
// returns promise resolved on screenshot
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
            return Q( false );
        }
    }

    before(function () {
        var serverConfig = {host:'localhost',port: 4723};
        driver = wd.promiseChainRemote(serverConfig);
//        require("./logging").configure(driver);

        var desired = { browserName: '',
            'appium-version': '1.0',
            platformName: 'iOS',
            platformVersion: '7.1',
            deviceName: 'iPhone',
            app: '/Users/paulcook/levexis/canappr/phonegap/platforms/ios/build/emulator/Medit8.app' };
        return driver.init(desired);
    });
    after(function () {
        // can we screenshot?
        return takeScreenshot( 'test.png' ).then( function () {
            driver.quit();
        } ,
            function (err) {
                console.log('err',err);
                driver.quit();
            } );
    });

    afterEach(function () {
        allPassed = allPassed && this.currentTest.state === 'passed';
    });
    /*
     it("should click the button", function () {
     return driver
     .sleep(5000)
     //          .elementByClassName('UIAButton').click() // click button
     .elementByName('Get Started' ).click()
     .elementByXPath('//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[21].text()') // should use xpath for first item in list
     //          .context('WEBVIEW_1')
     //          .sleep(5000)
     .title().should.eventually.include('Medit8');

     return driver
     .elementByXPath('//UIATextField[@value=\'Enter URL\']')
     .sendKeys('https://www.google.com')
     .elementByName('Go').click()
     .elementByClassName('UIAWebView').click() // dismissing keyboard
     .context('WEBVIEW')
     .sleep(1000)
     .waitForElementByName('q', 5000)
     .sendKeys('sauce labs')
     .sendKeys(wd.SPECIAL_KEYS.Return)
     .sleep(1000)
     .title().should.eventually.include('sauce labs');
     });
     */
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
//            .sleep(999000);
    });

});
