/* home ios page object */
/*

 Home view

TagLine //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[17]
Subscription Des //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[16]
Modules Des //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[19]
First module subscribed //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[20]
// will need to use by name to access list elements
Button //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAButton[1]


 */
var Q = require ('q' ),
    _ = require ('underscore' ),
    SLEEP_TIME = process.env.APPIUM_PAUSE || 1000; // number of milliseconds between commands to allow transitions to complete as wait for doesn't work, increase if tests fail as element not present

module.exports = function (driver) {
    driver = driver || window.driver;
    // needs the precise text to work
    this.tapOn = function( listText ) {
        // actually should mixin on all the methods to the response.
        return _.extend ( driver.sleep(SLEEP_TIME).elementByName( listText ).click() , { tapOn: this.tapOn } );
    };
    this.getTagLine = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[17]");
    };
    this.getAppDescription = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[16]");
    };
    this.getFirstItem = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[20]");
    };
    this.getButton = function () {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAButton[1]");
    };
    return this;
};
