var express = require('express'),
    app = express();
// PORT is specified on heroku
var SERVER= { PORT: process.env.PORT || 9000,
			  maxAge: 0}; //no cache

/**
 * Middleware
 */
app.use(express.static(__dirname + '/client', { maxAge: SERVER.maxAge }));

console.log ( 'starting on' , SERVER.PORT )
module.exports = app.listen( SERVER.PORT );
