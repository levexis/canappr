/* main page object */
/*

 Main view, is every three elements for list, current using tapOn for precise tap text

 List Item 1 //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[15]
 List Item 2 //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[18]
 List Item 3 //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[21]


 */
var Q = require ('q' ),
// we're assuming this isn't supported - waitForElementByXPath
    SLEEP_TIME = process.env.APPIUM_PAUSE || 1000,
    iosPage = require ('./home-ios-appage' ); // number of milliseconds between commands to allow transitions to complete as wait for doesn't work, increase if tests fail as element not present

module.exports = function (driver) {
    driver = driver || window.driver;
    // inherit iosPage and call constructor
    iosPage.apply ( this , arguments );

    // these first two could be a base page object class
    this.getSwitch = function () {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIASwitch[1]");
    };
    this.getTitle = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[9]");
    };
    this.getDescription = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[10]");
    };
    this.getListTitleText = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[11]");
    };

    return this;
};
