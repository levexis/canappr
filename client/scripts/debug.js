// this creates and exposes a debugger object and decorates the $log service with it
// also adds in the weinr local debugging script
// todo: only supports debug and error calls
(function (angular , window, _) {
    "use strict";
    // this can be used to replace the rootScope nonsense
    var myApp = angular.module( 'canAppr' );
    function addWeinre() {
        var js = document.createElement('script' ),
            first = document.getElementsByTagName('script')[0];
        js.src = 'http://localhost:8080/target/target-script-min.js#canAppr';
        first.parentNode.insertBefore(js, first);
    }
    var Debugger =function(useLocal) {
        /** safari is very easy to get into private browsing mode which can cause all manner of weirdness
         * including throwing errors when you try to set local storage */
        function _isLocalStorageSupported() {
            try {
                var testKey = 'test',
                    storage = window.localStorage,
                    testResult;
                // checks we can write / read / remove
                storage.setItem(testKey, '1');
                testResult = ( storage.getItem(testKey, '1') === '1' );
                storage.removeItem( testKey );
                return testResult;
            } catch (error) {
                return false;
            }
        }
        /* public bolean, picked up by registry and used directly on landing page */
        this.isLocalStorage = _isLocalStorageSupported();
        this.useLocal = ( useLocal && this.isLocalStorage ) || false;
        if ( useLocal ) {
            var stored = window.localStorage.getItem('dw-debug');
            if (stored) { this.history = JSON.parse(stored); }
        }
        this.history = this.history || [];
        if ( !this.isLocalStorage ) { this.history.push ( [ new Date() , 'localStorage disabled, may be in private browsing mode' ] ); }
        return this;
    };
    Debugger.prototype = {
        store: function() {
            if (this.useLocal) {
                window.localStorage.setItem( 'dw-debug', _.clone( JSON.stringify( this.history ) ) );
            }
        },
        // resets at 100 lines to save space
        log : function() {
            if (!arguments[0]) {
                return false;
            }
            var outLine = [],
                i=0;
            if ( this.history && this.history.length > 200 ) {
                this.reset();
                this.history.push( [ new Date() , 'log reset @ 200 entries'] );
            }
            outLine.push( new Date() );
            while ( typeof arguments[i++] !== 'undefined' ) {
                outLine.push(  arguments[i-1] );
            }
            this.history.push(outLine);
            this.store();
        },
        reset : function() {
            this.history = [];
            this.store();
        },
        getHistory : function() {
            return this.history;
        },
        show : function() {
            this.history.forEach(function (line) {
                window.console.log (line);
            });
        },
        display : function( hide ) {
            // todo: needs to be changed for angular, in fact should be a directive
            /*
            var debugDiv = $('#debug');
            if (!debugDiv.length) {
                debugDiv = jQuery('<div/>', {
                    id: 'debug',
                    text: JSON.stringify( this.history)
                }).appendTo('body');
            } else {
                debugDiv.html( JSON.stringify( this.history)) ;
            }
            if ( hide ) debugDiv.hide(); // nicer for screenshots
            */
        }
    };
    // intialise global debugger but without local storage as we need to address cyclic object errors with stringfiy
    // todo: can underscore filter out cyclic references or should we just create from hasOwnProperty?
    window.dwDebugger = new Debugger( false );
    myApp.config(  function( $provide ) {
            $provide.decorator( '$log',  function( $delegate ) {
                // Save the original $log.debug()
               var bugger = window.dwDebugger;
               function decorateCurry(origFn) {
                   return function () {
                       var args = [].slice.call( arguments );
                       // Call the original with the output prepended with formatted timestamp
                       try {
                           origFn.apply( null, args );
                           // we log second just in case args cause a problem!
                           if ( typeof bugger === 'object' ) {
                               bugger.log.apply( bugger, args );
                           }
                       } catch (err) {
                           // throwing a karma error, maybe if debug stubbed out later?!?
                       }
                   };
               }
                $delegate.debug = decorateCurry( $delegate.debug );
                $delegate.error = decorateCurry( $delegate.error );
                return $delegate;
            });
    });
    addWeinre();
})(angular , window , _); // jshint ignore:line

