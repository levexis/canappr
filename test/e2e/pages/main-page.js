/* main page object */
var Q = require ('q');
if ( typeof protractor === 'undefined' ) {
    protractor = require('protractor');
}
module.exports = function () {
    var _that = this,
        navQ;
    function _refreshList() {
        try {
            _that.main = element( by.id( 'main' ) );
            // something strange happening here, think we may have more than one main hence we are getting all rather than element back
            if ( _that.main.all === 'function' ) {
                _that.list = _that.main.all( by.tagName( 'li' ) );
            } else {
                _that.list = _that.main.element.all( by.tagName( 'li' ) );
            }
            return true;
        } catch ( err ) {
            // main not yet loaded / visible
            return false;
        }
    }
    /* get the page */
    this.get = function( navTo ) {
        var _deferred = new Q.defer();
        browser.get('/#/main');
        browser.navigate().refresh().then ( function () {
            // now defaults to home page so click on button to get to organizations
            browser.waitForAngular().then ( function ( resolved ) {
                _refreshList();
                _deferred.resolve( resolved );
            });
        });

        return _deferred.promise;
    };
    /* allows you to set where you want to nave to
     * eg organizations:Triratna, courses: Meditations, modules: Breathing
     * will click first that matches - gets into recursive hell - see below
      * @returns a promise, which is only rejected if item not found in list
     */
    this.navTo = function ( where ) {
        navQ = navQ || new Q.defer();
        this.getListTitleText().then ( function ( listText ) {
            var listName = new String (listText ).trim().toLowerCase(),
                _found = false,
                _what = ( listName && typeof where === 'object' && where[listName] ) ? new String( where[listName] ).trim().toLowerCase() : '',
                _searches = [],
                // looks for search text in text of list item
                // clicks on it if found and recursively calls navTo
                _findAndClick = function ( item ) {
                    _searches.push (
                        item.getText().then( function ( listText ) {
                            var itemName = new String( listText ).trim().toLowerCase();
                            if ( itemName.indexOf( _what ) > -1 ) {
//                                console.log( 'found', _what , 'in', itemName );
                                // if it matches then click and try again recursively
                                item.click().then( function () {
//                                    console.log( 'navigated', listName );
                                    _refreshList();

                                    _that.navTo( where );
                                    /*if ( listName !== 'modules' ) {
                                        return _that.navTo( where )
                                    } else {
                                        console.log ('RESOLVED modules NO LIST', '');
                                        return navQ.resolve ( '' );
                                    }*/
                                } );
                            } else {
//                                console.log( 'NOT found', _what, 'in', itemName );
                                return false;
                            }
                        } ,
                        function ( err ) {
//                            if (err.code === 10 ) console.log( 'stale element warning' );
                            if (err.code !== 10 ) console.log( err );
                        }
                        )
                    );
                };
            //  if a criterias is specified for the list on the current view
//            console.log('what',_what,listName,!!_what,typeof _what);
            if ( _what ) {
                _that.getList().then(
                    function ( list ) {
                        _searches = [];
 //                       console.log ('list length', list.length);
                        // cycle through list elements and check each one for a match
                        list.forEach( _findAndClick );
                        // if no match then reject the promise and notify
                        // this only should happen when all promises resolved
 //                       console.log ('searches', _searches.length);
                        Q.all( _searches ).done( function () {
                                // dodgy as hell this - listName could be anything at this point
                                // but will probably be the last one
//                                console.log('all done',navQ.promise.isFulfilled());
                                if ( !navQ.promise.isFulfilled() ) {
                                    if ( _found ) {
//                                        console.log( 'MAIN RESOLVE',listName );
                                        return navQ.resolve( listName );
                                    } else {
//                                        console.log( 'MAIN REJECT NOT FOUND' );
                                        return navQ.reject( 'unable to find ' + where[listName] + ' in ' + listName );
                                    }
                                }
                            },
                            function () {
//                                console.log( 'all rejected?' );
                            }
                        );
                    }
                );
            } else {
//                console.log( 'RESOLVE ON COMPLETE',listName );
                // nowhere else to go so resolve promise
                return navQ.resolve( listName );
            }
        }, function (err) {
//            console.log ('RESOLVE - no list');
            return navQ.resolve ( '' );
        });
        return navQ.promise;
    };
    /* clickOn
     * @returns promise */
    this.clickOn = function ( what ) {
        what = (what + '').trim().toLowerCase();
        var clickQ = Q.defer(),
            _finders = [],
            _found = false,
            _findAndClick = function ( item ) {
                var findQ = Q.defer();
                item.getText().then( function ( listText ) {
                        var itemName = listText.trim().toLowerCase();
                        if ( itemName.indexOf( what ) > -1 ) {
//                            console.log( 'found', what , itemName );
                            // if it matches then click and try again recursively
                            item.click().then( function () {
                                _found = true;
//                                console.log( 'navigated' );
                                findQ.resolve( what );
                            } );
                        } else {
//                            console.log( 'NOT found', what, 'in', itemName );
                            findQ.resolve( '');
                        }
                    } ,
                    function ( err ) {
                        findQ.resolve( '');
                       // ie click has already happened if (!_found && err.code === 10 ) console.log( 'stale element warning' );
                    }
                );
                _finders.push ( findQ.promise );
                return findQ.promise;
            };
            //  if a criterias is specified for the list on the current view
            if ( what ) {
//                console.log('click ', what );
                this.getList().then(
                    function ( list ) {
//                        console.log ('list length', list.length);
                        // cycle through list elements and check each one for a match
                        list.forEach( _findAndClick );
                        // if no match then reject the promise and notify
                        Q.all(_finders).done ( function () {
                            if ( _found) {
//                                console.log ('RESOLVED');
                                clickQ.resolve( what);
                            } else {
//                                console.log ('REJECT ');
                                clickQ.reject( 'unable to find ' + what);
                            }
                        });
                    }
                );
            } else {
//                console.log ('what?');
                throw new Error ( what + ' not defined ' );
            }
        return clickQ.promise;
    };
    this.main = element( by.id('main') );
    /* a little promise practice */
    this.getList = function () {
        var _promises= [] ,
            _outList = [] ;
        function _resolver(i) {
            return function (what) {
  //              console.log ( 'resolver' , i , _outList.length );
                _outList[i] = what;
                //return what; this freezes everything so have had to create an array and then
                // return that
            };
        }
        return this.list.count()
            .then( function ( items ) {
                var item = 0;
                while (item < items ) {
                    _promises.push( _that.list.get( item ).then ( _resolver(item) ) );
                    item++;
                }
//                console.log ( 'promises' , _promises.length);
                return Q.all( _promises ).then ( function () {
//                    console.log ( 'returned' , _outList.length);
                    return _outList;
                });
            });
    };
    this.getTitle = function() {
        return this.main.element( by.binding('{{model.name}}') );
    };
    this.getDescription = function() {
        return this.main.element( by.binding('model.html') );
    };
    this.getListEmpty = function() {
        return this.main.element( by.css('.ca-main-empty') );
    };
    this.getListTitleText = function() {
        return this.main.element( by.css('.ca-main-list') ).getAttribute('title');
    };
    this.getSubscribe = function () {
        return this.main.element( by.css('.topcoat-switch__input') );
    };
    _refreshList();
    return this;
};
