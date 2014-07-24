var chai = require('chai' ),
    chaiAsPromised = require('chai-as-promised' ),
    Q = require('q' ),
    _ = require('underscore');
// do I need this?
//require("mocha-as-promised")();

chai.use(chaiAsPromised);
var expect = chai.expect;

// should we set the API url here? Maybe configure the factory?
var logIt = function (message) {
    console.trace(message);
};

var PromiseTester = function (debug) {
    this._stack = [];
    this.created = new Date();
    this.log =  this.debug ? this.log : function () {};
    return this;
};
PromiseTester.prototype = {
    setTimer: function ( timer , to ) {
        var _scope = this;
        timer = timer || 1000;
        this.log( 'setTimeout' , timer , to );
        setTimeout( function () {
            // convert function into a time
            if ( typeof to === 'function' ) to = to.call( _scope );
            _scope.log ( 'timeout fired @ ',_scope.getElapsed(),to,timer,typeof to);
            _scope.resolver( to );
        }, timer );
    },
    getElapsed : function () {
        return new Date().getTime() - this.created.getTime();
    },
    simple: function (timer , to) {
        var deferred = Q.defer(),
            _that = this;
        timer = timer || 1000;
        setTimeout(function() {
            if ( to ) {
                if (typeof to === 'function' ) to = to.apply(_that);
                _that.log('simple resolved',to);
                deferred.resolve( to );
            } else {
                _that.log('simple rejected',to);
                deferred.reject( to );
            }
        }, timer);
        return deferred.promise;
    },
    // will resolve the promise if end of queue or a rejection
    resolver: function ( to ) {
        var current = this._stack.shift(),
            next;
        this.log ( this.getElapsed(), 'resolver left' , this._stack.length, current );
        if (to ) {
            this.log('resolved',to);
            if (!this._stack.length) {
                this.deferred.resolve( to );
            } else {
                next = this._stack.shift();
                this.log('cb',current,next);
                // next callback
                this.log( 'calling next' );
                // push resolved value onto args to next call
                next.args.push (to);
                // what about passing through resolved values
                next.fn.apply( next.scope , next.args );
            }
        } else {
            // immediate rejection
            this.log('simple rejected',to);
            this.deferred.reject( to );
        }
    },
    // idea is to allow method().method().method().then
    chainable : function (timer , to) {
        this.deferred = this.deferred || Q.defer();
        // this must be an async function or we should add an async method to run it on nextTick and return promises
        // may be better off to put arguments and method onto a stack and then apply?
        // should be able to call simple?
        this._stack.push (
            { fn : this.setTimer,
              scope: this,
//              args : [ timer , to ]
              args: Array.prototype.slice.call(arguments) }
        );

        if ( this._stack.length === 1 ) this._stack[0].fn.apply( this._stack[0].scope , this._stack[0].args );
        return _.extend(this,this.deferred.promise);
    }
};

describe('main', function () {
    describe ('Promises', function() {
        this.timeout(5000);
         it( 'should  keep a promise', function () {
            var pt = new PromiseTester();
            return expect (pt.simple(250,pt.getElapsed ) ).to.eventually.be.at.least(250);
             // need to test time of chained promises
         });
        it( 'should reject a promise', function () {
            var pt = new PromiseTester();
            return expect (pt.simple(250,false ) ).to.eventually.be.rejected;
            // need to test time of chained promises
        });
        it( 'should allow for chains', function () {
            var pt = new PromiseTester();
            return expect (pt.simple(250,true ).then ( function () { return pt.simple(250, pt.getElapsed); } )).to.eventually.be.at.least(500);
            // need to test time of chained promises
        });
        it( 'should allow anything if you dont return a promies', function () {
            var pt = new PromiseTester();
            expect (pt.simple(1000,true ).then ( function () { return pt.simple(1000, pt.getElapsed); } )).to.eventually.be.at.least(3000);
            // need to test time of chained promises
            return true;
        });
        it( 'should chain once', function () {
            var pt = new PromiseTester();
            return expect ( pt.chainable(250,pt.getElapsed )).to.eventually.be.at.least(250);
        });
        it( 'should allow multiple chaining', function () {
            var pt = new PromiseTester();
            return expect ( pt.chainable(250,pt.getElapsed ).chainable(300, pt.getElapsed) ).to.eventually.be.at.least(550);
        });
        it( 'should allow reject on first fail', function () {
            var pt = new PromiseTester();
            return expect ( pt.chainable(250,false ).chainable(300, pt.getElapsed) ).to.eventually.be.rejected;
        });
        it( 'should return the last value', function () {
            var pt = new PromiseTester();
            return expect ( pt.chainable(250,true ).chainable(300, pt.getElapsed) ).to.eventually.be.at.least(550);
        });
        it( 'should allow long chaining into then', function () {
            var pt = new PromiseTester();
            return expect ( pt.chainable(100,true ).chainable(100, pt.getElapsed ).then(function() { return pt.simple(100,pt.getElapsed);} )) .to.eventually.be.at.least(300);
        });
    });
    /*
         it('uses promises properly', function() {
                   var defer = Q.defer();
         setTimeout(function() {
         defer.resolve(2);
         }, 1000);
         return Q.all([
         Q(expect(defer.promise).to.eventually.equal(0))
         ]);
     });
     */

});