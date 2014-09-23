/* base class for ios page objects */
"use strict";
(function () {
    var Q = require( 'q' ),
        _ = require( 'underscore' ),
    // we're assuming this isn't supported - waitForElementByXPath
        SLEEP_TIME = process.env.APPIUM_PAUSE || 1000; // number of milliseconds between commands to allow transitions to complete as wait for doesn't work, increase if tests fail as element not present

    function IosPage( driver ) {
        driver = driver || window.driver;

        var elements = {
                text : [], // 'UIAStaticText'
                button : [],  //'UIAButton'
                switch : [] },//'UIASwitch',
            map = { text : 'UIAStaticText',
                button : 'UIAButton',
                switch : 'UIAButton' },
            XBASE = '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAWebView[1]/';

        return this;
    }

    // having to check all elements, this could be caches as will be a dog if running a remote appium server - eg saucelabs
    IosPage.prototype = {
        getElements : function ( type ) {
            var deferred = new Q.defer();
            if ( !map[type] ) {
                throw new Error( 'element type [ ' + type + ' ] null or not recognised' );
            }
            driver.sleep( SLEEP_TIME ).elementsByXPath( XBASE + map[type] ).then( function ( values ) {
                // could probably cache if number of elements not changed? Would need to keep a count
                map[type].lastCount = values.length; // last count before filtering out displayed
                // reset existing elements
                var _promises = [];
                elements[type] = [];
                values.forEach( function ( el ) {
                    _promises.push( el.isDisplayed().then( function ( displayed ) {
                        if ( displayed ) {
                            return el.text().then( function ( text ) {
                                elements[type].push( { path : XBASE + map[type] + '[' + el.value + ']',
                                    text : text,
                                    element : el } );
                            } );
                        }
                    } ) );
                } );
                return Q.all( _all ).then( function () {
                    return elements[type];
                } );
            } );
            return deferred.promise;
        },
        tapOn : function ( listText ) {
            return this.getElements( 'text' ).then( function ( elements ) {
                return _.findWhere( { text : listText } ).click();
            } );
        }
    };

    module.exports = IosPage;
})();