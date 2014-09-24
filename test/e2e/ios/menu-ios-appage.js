/* menu ios page object */
/*

Nav view

back button             .execute("mobile: tap", [{ "tapCount": 1, "touchCount": 1, "duration": 0.1, "x": 17, "y": 42 }])
position of //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[1] + 16,16

 menu button             .execute("mobile: tap", [{ "tapCount": 1, "touchCount": 1, "duration": 0.1, "x": 290, "y": 42 }])
position of /UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[7] + 16,16

 back text //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[6]

Menu view
Home //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[2]
Org  //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[4]
// these vary depending on whats open on the right, eg for content and main its 12,22 so need to specify if home open?
Course  //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[6]
Module  //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[10]

 */
var Q = require ('q' ),
    _ = require ('underscore' ),
    SLEEP_TIME = process.env.APPIUM_PAUSE || 1000,
    IosPage = require ('./ios-appage' ); // number of milliseconds between commands to allow transitions to complete as wait for doesn't work, increase if tests fail as element not present

var MenuPage = function (driver) {
    driver = driver || window.driver;
    // inherit iosPage and call constructor
    IosPage.apply ( this , arguments );

    var that = this;

    // should calculate this by using getPosition, screen size, resolution etc but will do to start with
    this.tapOpen = function () {
        return driver.sleep( SLEEP_TIME ).execute( "mobile: tap", [
            { "tapCount" : 1, "touchCount" : 1, "duration" : 0.1, "x" : 290, "y" : 42 }
        ] );
    };
    this.slideOpen = function () {
        return driver.sleep( SLEEP_TIME ).execute( "mobile: swipe", [
            { "touchCount": 1, "startX": 19, "startY": 441, "endX": 299, "endY": 447, "duration": 0.5 }
        ] );
    };
    // when I click back it seems to leave elements behind
    this.tapBack = function () {
        return driver.sleep( SLEEP_TIME ).execute( "mobile: tap", [
            { "tapCount": 1, "touchCount": 1, "duration": 0.1, "x": 17, "y": 42 }
        ] );
    };
    // gets the text use tapBack to click on it
    this.getHome = function () {
        return driver.sleep( SLEEP_TIME ).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[2]");
    };
    // opens menu and taps home
    this.goHome = function () {
        // slide open as menu isn't visible on home page
        return this.slideOpen().then(function () {
            return that.getHome().click();
        });
    };
    // needs the precise text to work - CAN USE THE getList on prototype
    this.getOrg = function() {
        return driver.sleep( SLEEP_TIME ).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[4]");
    };
    // positions change based on content of right pane. safer to use explicit tapOn
    this.getCourse = function(rightView) {
        if ( rightView === 'home' ) {
            return driver.sleep( SLEEP_TIME ).elementByXPath( "//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[6]" );
        } else {
            return driver.sleep( SLEEP_TIME ).elementByXPath( "//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[12]" );
        }
    };
    this.getModule = function(rightView) {
        if ( rightView === 'home' ) {
            return driver.sleep( SLEEP_TIME ).elementByXPath( "//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[10]" );
        } else {
            return driver.sleep( SLEEP_TIME ).elementByXPath( "//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[22]" );
        }
    };
    return this;
};
MenuPage.prototype = new IosPage();
module.exports = MenuPage;