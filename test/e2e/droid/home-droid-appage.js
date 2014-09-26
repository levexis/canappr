/* home ios page object */
/*

 */
var Q = require ('q' ),
    _ = require ('underscore' ),
    SLEEP_TIME = process.env.APPIUM_PAUSE || 1000,
    DroidPage = require ('./droid-appage' ); // number of milliseconds between commands to allow transitions to complete as wait for doesn't work, increase if tests fail as element not present

var HomePage = function (driver) {
    driver = driver || window.driver;
    // inherit iosPage and call constructor
    DroidPage.apply ( this , arguments );

    // THESE PATHS ARE TOTALLY UNRELIABLE!
    this.getTagLine = this.teleCurry.call( this,2);

    this.getWelcome = this.teleCurry.call( this,3);

    this.getFirstParagraph = this.teleCurry.call( this,3);

    this.getSecondParagraph = this.teleCurry.call( this,4);
    this.getThirdParagraph = this.teleCurry.call( this,5);

    this.getFirstItem = this.teleCurry.call( this,6);

    return this;
};
HomePage.prototype = new DroidPage();

module.exports = HomePage;