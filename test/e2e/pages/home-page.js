/* home page object */
if ( typeof protractor === 'undefined' ) {
    protractor = require('protractor');
}
module.exports = function () {
    var _that = this;
    /* get the page */
    this.get = function() {
        browser.get('/#/home');
        return browser.navigate().refresh().then ( function () {
            _that.main = element( by.id( 'main' ) );
        });
    };
    this.main = element( by.id('main') );
    this.getButton = function() {
        return this.main.element( by.tagName( 'button' ) );
    };
    this.getBlurb = function() {
        return this.main.element( by.css( '.ca-blurb' ) );
    };
    return this;
};
