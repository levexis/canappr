/* menu page object, have been playing with patterns
 When debugging or first writing test suites, you can use
 java -jar node_modules/grunt-selenium-webdriver/jar/senium-server-standalone-2.42.2.jar
 node node_modules/protractor/bin/elementexplorer.js "http://localhost/canappr/client"
 to debug in webstorm use grunt webstorm and then configure protractor as a node service
 pointing at node_modules/protractor/lib/cli.js
 */
var Q = require ('q');
if ( typeof protractor === 'undefined' ) {
    protractor = require('protractor');
}
module.exports = function () {
    var _that = this;
    this.menu = element( by.id('menu') );
    try {
        this.list = this.menu.element.all( by.tagName( 'li' ) );
    } catch (err) {
        // menu not yet loaded / visible
    }
    /* a little promise practice */
    this.getList = function () {
        var _outList= [];
        return this.list.count()
            .then( function ( items ) {
                var item = 0;
                while (item < items ) {
                    _outList.push( _that.list.get( item++ ).then );
                }
                // this just returns resolved promises, seek main-page for an
                // example that returns a chainable list so you can say list[0].getText() etc
                return Q.all( _outList );
            });
    };
    this.getHome = function() {
        return this.list.get(0);
    };
    this.getOrg = function() {
        return this.list.get(1);
    };
    this.getCourse = function() {
        return this.list.get(2);
    };
    this.getModule = function() {
        return this.list.get(3);
    };
    this.get = function( navTo ) {
        var _deferred = new Q.defer();
        browser.get('/');
        return browser.waitForAngular().then ( function ( resolved ) {
            _that.list = _that.menu.element.all( by.tagName ('li') );
            _deferred.resolve( resolved);
        });
        return _deferred.promise;
    };
    return this;
};
