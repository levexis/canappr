/* home page object */
var Q = require ('q');
if ( typeof protractor === 'undefined' ) {
    protractor = require('protractor');
}
module.exports = function () {

    var _that = this;
    /* get the page */
    this.get = function () {
        browser.get( '/#/content' );
        return browser.navigate().refresh().then( function () {
            _that.main = element( by.id( 'main' ) );
        } );
    };
    this.main = element( by.id( 'main' ) );
    this.getPlayPause = function () {
        return this.main.element( by.css( '.ca-play' ) );
    };
    this.getProgress = function() {
        return this.main.element( by.css( '.ca-progress' ) );
    };
    this.getTitle = function () {
        return this.main.element( by.css( '.ca-content-title' ) );
    };
    // returns remaining time in seconds, will only work up to 59:59
    this.getRemaining = function () {
        var deferred= Q.defer();
        this.getTitle().findElement( by.tagName('span') ).getText().then ( function ( timeStr) {
            var mins = timeStr.substr( 0,2 )* 1,
                secs = timeStr.substr( 3,2 ) * 1;
            deferred.resolve( mins*60 + secs );
        });

        return deferred.promise;
    };

    return this;
};
