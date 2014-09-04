/* home page object */
var Q = require ('q');
if ( typeof protractor === 'undefined' ) {
    protractor = require('protractor');
}
module.exports = function () {
    function getList( list ) {
        var _outList = [], _promises = [], deferred = Q.defer();
        list.count()
            .then( function ( items ) {
                var item = 0;
                while ( item < items ) {
                    _promises.push( list.get( item++ ).then( function ( course ) {
                        return course.getText().then( function ( text) {
                            _outList.push( text );
                        });
                    }));
                }
                Q.all( _promises ).then( function () {
                    deferred.resolve ( _outList );
                });
            } );
        return deferred.promise;
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
