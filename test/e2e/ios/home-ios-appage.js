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
        // have a probem where old elements not being removed. Need to check isDisplayed or will get server side errors
        return driver.sleep(SLEEP_TIME).elementsByName( listText ).last().click();
    };
    // THESE PATHS ARE TOTALLY UNRELIABLE!
    this.getTagLine = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[23]");
    };
    this.getWelcome = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[16]");
    };
    this.getSecondParagraph = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[27]");
    };
    this.getFirstParagraph = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[24]");
    };
    this.getSecondParagraph = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[27]");
    };
    this.getFirstItem = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[28]");
    };
    this.getButton = function () {
        return driver.sleep(SLEEP_TIME).elementsByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAButton" ).last();
    };
    return this;
};
