/* content ios page object */
/*

Content view

 Switch //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIASwitch[1]
Title //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[17]
Body //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[17]
Track //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[19]
Remaining //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[20] (removes brackets)
Play button //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[22]

 */
var Q = require ('q' ),
    _ = require ('underscore' ),
    SLEEP_TIME = process.env.APPIUM_PAUSE || 1000; // number of milliseconds between commands to allow transitions to complete as wait for doesn't work, increase if tests fail as element not present

module.exports = function (driver) {
    driver = driver || window.driver;

    this.getTitle = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[17]");
    };
    this.getDescription = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[17]");
    };
    // you can tap the track for playPause
    this.getTrack = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[19]");
    };
    this.getRemaining = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[20]");
    };
    this.getRemainingSecs = function() {
        return this.getRemaining();
        // looks like ios gets underlying value?
        /*
        return this.getRemaining().then ( function ( timeStr ) {
            console.log ('getRemainingSecs',timeStr);
            var mins = timeStr.substr( 0,2 )* 1,
                secs = timeStr.substr( 3,2 ) * 1;
            return ( mins*60 + secs );
        });
        */
    };
    // bug in ui automation means you can't tap this but you can use tapPlay
    this.getPlayPause = function() {
        return driver.sleep(SLEEP_TIME).elementByXPath("//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAStaticText[22]");
    };
    // should get playPause button and and 16,16
    this.tapPlayPause = function() {
        return driver.sleep( SLEEP_TIME ).execute( "mobile: tap", [
            { "tapCount": 1, "touchCount": 1, "duration": 0.5, "x": 24, "y": 271 }
        ] );
    };
    // seeks to a percentage between 0 and 100, should look for progress bar and get attributes! Prog bar is //UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/UIAElement[1]
    this.tapSeek = function(seekPercent) {
        var startProg = 48, endProg=48 + 271, progY=270;
        return driver.sleep( SLEEP_TIME ).execute("mobile: tap", { "tapCount": 1, "touchCount": 1, "duration": 0.5, "x": 306, "y": 268 })
            .execute("mobile: tap", { "tapCount": 1, "touchCount": 1, "duration": 0.5, "x": startProg + ( endProg- startProg) * seekPercent , "y": 270 });
    };
    return this;
};
