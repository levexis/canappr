/* main page object */
/*

 Main view, is every three elements for list, current using tapOn for precise tap text

 List Item 1 //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[15]
 List Item 2 //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[18]
 List Item 3 //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[21]

 0 'main' 'Home' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[15]'
 1 'main' 'Organizations' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[18]'
 2 'main' 'Triratna East Surrey' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[24]'
 3 'main' 'The Now Project' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[27]'
 4 'main' 'Medit8 Sounds' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[30]'

 */
var Q = require ('q' ),
// we're assuming this isn't supported - waitForElementByXPath
    SLEEP_TIME = process.env.APPIUM_PAUSE || 1000,
    IosPage = require ('./ios-appage' ); // number of milliseconds between commands to allow transitions to complete as wait for doesn't work, increase if tests fail as element not present

var mainPage = function (driver) {
    driver = driver || window.driver;
    // inherit iosPage and call constructor
    IosPage.apply ( this , arguments );

    this.getTitle = this.teleCurry.call( this,1);
    this.getDescription = this.teleCurry.call( this,2);
    this.getFirstItem = this.teleCurry.call( this,3);

    return this;
};
mainPage.prototype = IosPage.prototype;

module.exports = mainPage;