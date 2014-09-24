/* home ios page object */
/*

 Home view

TagLine //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[17]
Subscription Des //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[16]
Modules Des //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[19]
First module subscribed //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[20]
// will need to use by name to access list elements
Button //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAButton[1]

 0 'home' 'Medit8 ' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[5]'
 1 'home' ' Spirtituality, shared.' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[7]'
 2 'home' 'Welcome to Medit8, you have not yet joined any courses' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[8]

 0 'home' 'Medit8 ' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[132]'
 1 'home' ' Spirtituality, shared.' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[134]'
 2 'home' 'Below is the list of courses you are currently subscribed to.' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[135]'
 3 'home' 'Modules listed with' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[136]'
 4 'home' 'are available for offline playback. You can remove the files by using the switch on the playback screen.' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[138]'
 5 'home' 'Medit8 Sounds - Bells and bowls' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[139]'
 6 'home' 'Chimes' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[141]'
 7 'home' 'Bowl' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[143]'
 8 'home' 'Singing Bowl' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[145]'


 */
var Q = require ('q' ),
    _ = require ('underscore' ),
    SLEEP_TIME = process.env.APPIUM_PAUSE || 1000,
    IosPage = require ('./ios-appage' ); // number of milliseconds between commands to allow transitions to complete as wait for doesn't work, increase if tests fail as element not present

var HomePage = function (driver) {
    driver = driver || window.driver;
    // inherit iosPage and call constructor
    IosPage.apply ( this , arguments );

    // THESE PATHS ARE TOTALLY UNRELIABLE!
    this.getTagLine = this.teleCurry.call( this,1);

    this.getWelcome = this.teleCurry.call( this,2);

    this.getFirstParagraph = this.teleCurry.call( this,2);

    this.getSecondParagraph = this.teleCurry.call( this,3);
    this.getThirdParagraph = this.teleCurry.call( this,4);

    this.getFirstItem = this.teleCurry.call( this,5);

    return this;
};
HomePage.prototype = new IosPage();

module.exports = HomePage;