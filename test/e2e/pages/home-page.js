/* home page object */
var Q = require ('q');
if ( typeof protractor === 'undefined' ) {
    protractor = require('protractor');
}
module.exports = function () {
    function getList( list ) {
        var _outList = [];
        return list.count()
            .then( function ( items ) {
                var item = 0;
                while ( item < items ) {
                    _outList.push( list.get( item++ ).then );
                }
                return Q.all( _outList );
            } );
    }
    var _that = this;
    /* get the page */
    this.get = function () {
        browser.get( '/#/home' );
        return browser.navigate().refresh().then( function () {
            _that.main = element( by.id( 'main' ) );
            _that.courses = _that.main.element.all( by.tagName( 'h3' ) );
            _that.modules = _that.main.element.all( by.tagName( 'li' ) );
        } );
    };
    this.main = element( by.id( 'main' ) );
    this.getButton = function () {
        return this.main.element( by.tagName( 'button' ) );
    };
    this.getBlurb = function () {
        return this.main.element( by.css( '.ca-blurb' ) );
    };
    this.getCourses = function() {
        return getList( this.courses );
    };
    this.getModules = function() {
        return getList( this.modules );
    };
    try {
        this.courses = this.main.element.all( by.tagName( 'h3' ) );
    } catch (err) {
        // main not yet loaded / visible
    }
    try {
        this.modules = this.main.element.all( by.tagName( 'li' ) );
    } catch (err) {
        // main not yet loaded / visible
    }
    return this;
};
