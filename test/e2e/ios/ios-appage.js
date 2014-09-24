/* base class for ios page objects */
"use strict";
var Q = require( 'q' ),
    _ = require( 'underscore' ),
// we're assuming this isn't supported - waitForElementByXPath
    SLEEP_TIME = process.env.APPIUM_PAUSE || 1000; // number of milliseconds between commands to allow transitions to complete as wait for doesn't work, increase if tests fail as element not present

function IosPage( driver ) {
    this.driver = driver;

    this.elements = {
            text : [], // 'UIAStaticText'
            button : [],  //'UIAButton'
            switch : [] };//'UIASwitch'
    this.map = { text : 'UIAStaticText',
            button : 'UIAButton',
            switch : 'UIASwitch' };
    this.XBASE = '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/';
//    this.XBASE = '//*/';
    return this;
}

// having to check all elements, this could be caches as will be a dog if running a remote appium server - eg saucelabs
IosPage.prototype = {
    // returns a promise not a webdriver promise instance so cannot chain on click
    getElements : function ( type ) {
        var deferred = new Q.defer(),
            self = this;
        if ( !this.map[type] ) {
            throw new Error( 'element type [ ' + type + ' ] null or not recognised' );
        }
//        console.log ( 'getElements',  type, this.XBASE + this.map[type] );
        this.driver.sleep( SLEEP_TIME ).elementsByXPath( this.XBASE + this.map[type] ).then( function ( values ) {
//            console.log('got elements');
            var _promises = [],el,
                // returns a Q promise
                _addIfDisplayed = function (el) {
//                    console.log('display check before');
                    return el.isDisplayed().then( function ( displayed ) {
//                        console.log('display check after');
                        if ( displayed ) {
                            return el.text().then( function ( text ) {
// assumption here that elements return in [the same] order, may need to use self.elements[type][index]= rather than push
//                                console.log ( 'found' , text,  self.XBASE + self.map[type] + '[' + (el.value*1 +1) + ']' );
                                // seems apple don't like arrays that start with 0 so you have to add 1 for selector!
                                // actually looks like the value is the elementId
                                return self.elements[type].push( { path : self.XBASE + self.map[type] + '[' + (el.value*1 +1) + ']',
                                    text : text,
                                    element : el } );
                            } );
                        }
                    });
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
            } );
        } );
        return deferred.promise;
    },
    // returns a function to get an element
    teleCurry: function ( pos ) {
        var self=this;
        return function () {
//            console.log('getElement' , pos, self );
            return self.getElements( 'text' ).then( function ( elements ) {
                return elements[ pos ].element;
            } );
        };
    },
// will return first visibile swicth or id can be used to set to a different one
    getSwitch: function ( id ) {
        id = id || 1;
        return this.getElements( 'switch' ).then( function ( els ) {
            return els[id-1].element;
        } );
    },
    getButton: function ( id ) {
        id = id  ||  1;
//        console.log('get button',id);
        return this.getElements( 'button' ).then( function ( els ) {
            return els[id-1].element;
        } );
    },
    tapButton: function ( id ) {
        return this.getButton(id).then( function ( element ) {
            return element.click();
        } );
    },
    tapSwitch: function ( id ) {
        return this.getSwitch(id).then( function ( element ) {
            return element.click();
        } );
    },
    // better to return driver.elementByPath?
    // may need to read the element then click so it's active?
    tapOn : function ( listText ) {
        return this.getElements( 'text' ).then( function ( elements ) {
//            console.log('list click',listText , _.findWhere( elements, { text : listText } ));
            return _.findWhere( elements, { text : listText } ).element.click();
        } );
    },
    elementExists : function ( listText ) {
//        console.log( 'looking for' , listText );
        return this.getElements( 'text' ).then( function ( elements ) {
//            console.log( 'found elements' , _.findWhere( elements, { text : listText } ), elements );
            return !!_.findWhere( elements, { text : listText } );
        } );
    },
    // gets contents fof list, filters on whereText if supplied (exact match)
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
    }
};

module.exports = IosPage;
