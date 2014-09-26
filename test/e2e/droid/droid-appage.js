/* base class for ios page objects */
"use strict";
var Q = require( 'q' ),
    _ = require( 'underscore' ),
    SLEEP_TIME = process.env.APPIUM_PAUSE || 1000; // number of milliseconds between commands to allow transitions to complete as wait for doesn't work, increase if tests fail as element not present
// DOES WAIT FOR ELEMENT WORK IN ANDROID?
function DroidPage( driver ) {
    this.driver = driver;

    this.elements = {
            text : [],
            button : [],
            switch : [] };
    this.map = { text : 'android.view.View',
            button : 'android.widget.Button',
            switch : 'android.widget.Checkbox' };
    return this;
}
function errorHandler(err) {
    console.trace(err);
    throw new Error(err);
}
// having to check all elements, this could be caches as will be a dog if running a remote appium server - eg saucelabs
DroidPage.prototype = {
    // returns a promise not a webdriver promise instance so cannot chain on click
    getElements : function ( type ) {
        var deferred = new Q.defer(),
            self = this;
        if ( !this.map[type] ) {
            return errorHandler( 'element type [ ' + type + ' ] null or not recognised' );
        }
//        console.log ( 'getElements',  type, this.XBASE + this.map[type] );
        this.driver.sleep( SLEEP_TIME ).elementsByAndroidUIAutomator('new UiSelector().className("' + this.map[type] + '")' ).then( function ( values ) {
//            console.log('got elements');
            var _promises = [],el,
                // returns a Q promise
                _addIfDisplayed = function (el) {
                    return el.isDisplayed().then( function ( displayed ) {
                        if ( displayed ) {
                            // the text is in the name, fucking obvious -not.
                            return el.getAttribute('name').then( function ( text ) {
// assumption here that elements return in [the same] order, may need to use self.elements[type][index]= rather than push
//                                console.log ( 'found' , text, text.charCodeAt(0) );
                                // seems apple don't like arrays that start with 0 so you have to add 1 for selector!
                                // actually looks like the value is the elementId
                                if ( text ) { //&& text.charCodeAt(0) < 256 )ignore blank or double byte icons
                                    return self.elements[type].push( { value : el.value,
                                        text : text.trim(),
                                        element : el } );
                                }
                            },
                            errorHandler);
                        }
                    },
                    errorHandler);
            };
            // could probably cache if number of elements not changed? Would need to keep a count
            self.map[type].lastCount = values.length; // last count before filtering out displayed
            // reset existing elements
            self.elements[type] = [];
            for ( var i = 0; i <values.length; i++ ) {
                el = values[i];
                _promises.push( _addIfDisplayed (el) );
            }
            Q.allSettled( _promises ).then( function () {
                deferred.resolve ( self.elements[type] );
            },
            errorHandler);
        } ,
        errorHandler);
        return deferred.promise;
    },
    // returns a function to get an element
    teleCurry: function ( pos ) {
        var self=this;
        return function () {
            return self.getElements( 'text' ).then( function ( elements ) {
                return elements[ pos ].element;
            },
            errorHandler);
        };
    },
// will return first visibile swicth or id can be used to set to a different one
    getSwitch: function ( id ) {
        id = id || 1;
        return this.getElements( 'switch' ).then( function ( els ) {
            return els[id-1].element;
        },
        errorHandler);
    },
    getButton: function ( id ) {
        id = id  ||  1;
//        console.log('get button',id);
        return this.getElements( 'button' ).then( function ( els ) {
            return els[id-1].element;
        } ,
        errorHandler);
    },
    tapButton: function ( id ) {
        return this.getButton(id).then( function ( element ) {
            return element.click();
        },
       errorHandler);
    },
    tapSwitch: function ( id ) {
        return this.getSwitch(id).then( function ( element ) {
            return element.click();
        } ,
        errorHandler);
    },
    // better to return driver.elementByPath?
    // may need to read the element then click so it's active?
    tapOn : function ( listText ) {
        return this.getElements( 'text' ).then( function ( elements ) {
//            console.log('list click',listText , _.findWhere( elements, { text : listText } ));
            return _.findWhere( elements, { text : listText } ).element.click();
        },
        errorHandler);
    },
    // pass in nothing and it will pass if any element exists
    elementExists : function ( listText ) {
//        console.log( 'looking for' , listText );
        return this.getElements( 'text' ).then( function ( elements ) {
//            console.log( 'found elements' , _.findWhere( elements, { text : listText } ), elements );
            return !! ( ( !listText && elements.length) || (_.isArray(elements) && _.findWhere( elements, { text : listText } ) ) );
        },
        function (err) {
            return false;
        });
    },
    // waits for a text element with the expression, polls every 100ms, resolves to element
    // pass nothing for wait for any element to exist, eg startup complete
    waitForTextElement : function ( text ) {
//        console.log( 'wait for' , text );
        var deferred = new Q.defer(),
            that = this,
            startTime = new Date().getTime(),
            TIMEOUT = 10;
        function checkForElement (text ) {
            try {
                if ( new Date().getTime - startTime > TIMEOUT * 1000 ) {
                    deferred.reject( 'timeout of ' + TIMEOUT + 's exceeded' );
                }
                that.elementExists ( text ).then ( function (el) {
                        if ( el ) {
                            deferred.resolve( el.element );
                        } else {
                            setTimeout( checkForElement( text ), 100 );
                        }
                    }, function (err) {
                        setTimeout ( checkForElement ( text ) , 100);
                    });
            } catch (err) {
                setTimeout ( checkForElement ( text ) , 100);
            }
        }
        checkForElement( text );
        return deferred.promise;
    }

    // gets contents fof list, filters on whereText if supplied (exact match)
    /* not been used yet, this can just get elements and slice from firstList element onwards
    getList : function ( firstElement , elsPerRow , whereText ) {
        elsPerRow = elsPerRow || 3;
        var outList = [];
        return this.getElements( 'text' ).then( function ( els ) {
            var nextEl = firstElement;
            for ( var i = 0; i < els.length; i++ ) {
                if ( els[i].element.value == this.nextEl && ( !whereText || whereText === els[i].text)  ) { //jshint ignore:line
                    outList.push( els[i] );
                }
            }
            return outList;
        } );
    }*/
};

module.exports = DroidPage;
