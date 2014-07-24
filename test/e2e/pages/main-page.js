/* main page object */
var Q = require ('q');
if ( typeof protractor === 'undefined' ) {
    protractor = require('protractor');
}
module.exports = function () {
    var _that = this,
        navQ;
    /* get the page */
    this.get = function( navTo ) {
        browser.get('/');
    };
    /* allows you to set where you want to nave to
     * eg organizations:Triratna, courses: Meditations, modules: Breathing
     * will click first that matches - gets into recursive hell - see below
      * @returns a promise, which is only rejected if item not found in list
    this.navTo = function ( where ) {
        navQ = navQ || new Q.defer();
        this.getListTitleText().then ( function ( listText ) {
            var listName = new String (listText ).trim().toLowerCase(),
                _found = false,
                _what = ( listName && typeof where === 'object' ) ? new String( where[listName] ).trim().toLowerCase() : '',
                // looks for search text in text of list item
                // clicks on it if found and recursively calls navTo
                _findAndClick = function ( item ) {
                        item.getText().then( function ( listText ) {
                            var itemName = new String( listText ).trim().toLowerCase();
                            if ( itemName.indexOf( _what ) > -1 ) {
                                console.log( 'found', _what , 'in', itemName );
                                // if it matches then click and try again recursively
                                item.click().then( function () {
                                    console.log( 'navigated', listName );
                                    if ( listName !== 'courses' ) {
                                        _that.navTo( where )
                                    } else {
                                        console.log ('RESOLVE', '');
                                    }
                                } );
                            } else {
                                console.log( 'NOT found', _what, 'in', itemName );
                            }
                        } ,
                        function ( err ) {
                            if (err.code === 10 ) console.log( 'stale element warning' );
                        });;
                };
            console.log('listName', listName);
            //  if a criterias is specified for the list on the current view
            if ( _what ) {
                console.log('where', _what );
                _that.getList().then(
                    function ( list ) {
                        console.log ('list length', list.length);
                        // cycle through list elements and check each one for a match
                        list.forEach( _findAndClick );
                        // if no match then reject the promise and notify
                        if ( !_found ) {
                            console.log ('REJECT ');
                            return navQ.reject( 'unable to find ' + where[listName] + ' in ' + listName );
                        }
                    }
                );
            } else {
                // resolve promise with final list name
                console.log ('RESOLVE', listName);
                return navQ.resolve ( listName );
            }
        }, function (err) {
            console.log ('RESOLVE - no list');
            return navQ.resolve ( '' );
        });
        return navQ.promise;
    };
     */
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
                            console.log( 'found', what , itemName );
                            // if it matches then click and try again recursively
                            item.click().then( function () {
                                _found = true;
                                console.log( 'navigated' );
                                findQ.resolve( what );
                            } );
                        } else {
                            console.log( 'NOT found', what, 'in', itemName );
                            findQ.resolve( '');
                        }
                    } ,
                    function ( err ) {
                        findQ.resolve( '');
                       // ie clikc has already happened if (!_found && err.code === 10 ) console.log( 'stale element warning' );
                    }
                );
                _finders.push ( findQ.promise );
                return findQ.promise;
            };
            //  if a criterias is specified for the list on the current view
            if ( what ) {
                console.log('click ', what );
                this.getList().then(
                    function ( list ) {
                        console.log ('list length', list.length);
                        // cycle through list elements and check each one for a match
                        list.forEach( _findAndClick );
                        // if no match then reject the promise and notify
                        Q.all(_finders).done ( function () {
                            if ( _found) {
                                console.log ('RESOLVED');
                                clickQ.resolve( what);
                            } else {
                                console.log ('REJECT ');
                                clickQ.reject( 'unable to find ' + what);
                            }
                        });
                    }
                );
            } else {
                console.log ('what?');
                throw new Error ( what + ' not defined ' );
            }
        return clickQ.promise;
    };

    var _that = this;
    this.main = element( by.id('main') );
    this.list = this.main.element.all( by.tagName ('li') );
    /* a little promise practice */
    this.getList = function () {
        var _promises= [] ,
            _outList = [] ;
        function _resolver(i) {
            return function (what) {
                _outList[i] = what;
                //return what; this freezes everything so have had to create an array and then
                // return that
            }
        }
        return this.list.count()
            .then( function ( items ) {
                var item = 0;
                while (item < items ) {
                    _promises.push( _that.list.get( item ).then ( _resolver(item) ) );
                    item++;
                }
                return Q.all( _promises ).then ( function () {
                    return _outList;
                });
            });
    };
    this.getTitle = function() {
        return this.main.element( by.binding('{{model.name}}') );
    };
    this.getDescription = function() {
        return this.main.element( by.binding('{{model.html}}') );
    };
    this.getListTitleText = function() {
        return this.main.element( by.css('.ca-main-list') ).getAttribute('title');
    };
    return this;
};
