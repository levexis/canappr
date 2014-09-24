/* content ios page object */
/*

Content view

 Switch //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIASwitch[1]
Title //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[17]
Body //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[17]
Track //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[19]
Remaining //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[20] (removes brackets)
Play button //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[22]

 0 'content' 'Modules' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[108]'
 1 'content' 'Chimes ' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[111]'
 2 'content' 'Tibettan Chimes x 3' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[112]'
 3 'content' '1. Chimes (' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[113]'
 4 'content' '00:09' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[114]'
 5 'content' ')' '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[115]'


 */
var Q = require ('q' ),
    _ = require ('underscore' ),
    SLEEP_TIME = process.env.APPIUM_PAUSE || 1000,
    IosPage = require ('./ios-appage' ); // number of milliseconds between commands to allow transitions to complete as wait for doesn't work, increase if tests fail as element not present

var ContentPage = function (driver) {
    driver = driver || window.driver;
    // inherit iosPage and call constructor
    IosPage.apply ( this , arguments );

    this.getTitle = this.teleCurry.call( this,1);
    this.getDescription = this.teleCurry.call( this,2);
    // you can tap the track for playPause
    this.getTrack = this.teleCurry.call( this,3);
    this.getRemaining = this.teleCurry.call( this, 4); // apply this context
    this.getRemainingSecs = function() {
        // looks like ios gets underlying value?
        return this.getRemaining().then( function ( element ) {
            return element.text().then( function ( timeStr ) {
                var mins = timeStr.substr( 0, 2 ) * 1,
                    secs = timeStr.substr( 3, 2 ) * 1;
                return ( mins * 60 + secs );
            } );
        });
    };
    // bug in ui automation means you can't tap this but you can use tapPlay
    // this is unreliable - just use tapPlayPause
    /*
    this.getPlayPause = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[22]");
    };*/
    // should get playPause button and and 16,16
    this.tapPlayPause = function() {
        return driver.sleep( SLEEP_TIME ).execute( "mobile: tap", [
            { "tapCount": 1, "touchCount": 1, "duration": 0.5, "x": 24, "y": 271 }
        ] );
    };
    // seeks to a percentage between 0 and 100, should look for progress bar and get attributes! Prog bar is //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAElement[1]
    this.tapSeek = function(seekPercent) {
        // have added 4 pixels at start. need to calculate clickable area as limits will not work. this is approximate
        var startProg = 52, endProg=startProg + 250, progY=270;
        return driver.sleep( SLEEP_TIME )
            .execute("mobile: tap", [{ "tapCount": 1, "touchCount": 1, "duration": 0.5, "x": startProg + ( endProg- startProg) * seekPercent/100 , "y": 270 }]);
    };
    return this;
};
ContentPage.prototype = new IosPage();
module.exports = ContentPage;