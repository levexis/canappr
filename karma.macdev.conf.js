/*
 * use this configuration for developing on mac, it does not generate coverage reports to do those run
 * standard karma without specifing config or use npm test
 * this assumes you have a standard set of browsers and want to autorun tests and you have installed chrome
 * and firefox but not Opera or IE. We install phantom, this is what is used in e2e testing (npm test).
 * Use:
 * karma start karma.macdev.conf.js
 */

// basic Karma configuration for e2e testing use, runs once and uses phantomjs
module.exports = function(config) {
    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: '',

        // frameworks to use, these need to be specified in plugins below
        frameworks: [ 'mocha', 'sinon-chai'],

        // frameworks to use, these need to be specified in plugins below
        frameworks: [ 'mocha', 'sinon-chai'],

        files : [
            'bower_components/angular/angular.js',
            'bower_components/underscore/underscore.js',
            'client/scripts/**/*.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/sinon/lib/*.js',
            'bower_components/sinon-chai/lib/sinon-chai.js',
            'test/unit/**/*.js'
        ],

        exclude: [
//            'app/lib/angular/angular-loader.js',
            'client/scripts/vendor/angular.min.js',
            'client/scripts/vendor/underscore.js'
//            'app/lib/angular/angular-scenario.js'
        ],

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['spec','progress'], // need to install spec using

        // web server port
        port: 9876,

        // CLI --runner-port 9100
        runnerPort : 9100,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
//        logLevel: config.LOG_DEBUG,
        logLevel: config.LOG_ERROR,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        // browsers need to be in plugins below
        browsers: [ 'Chrome' , 'Firefox', 'PhantomJS','Safari','Opera' ],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false, // not for run once

// disable reports these are produced on single run
//        preprocessors : {
//            '**/angular/scripts/controllers/*.js' : 'coverage',
//            '**/angular/scripts/*.js' : 'coverage',
//            '**/angular/directives/*.js' : 'coverage',
//            '**/angular/filters/*.js' : 'coverage',
//            '**/angular/services/*.js' : 'coverage'
//        },
//
//        htmlReporter: {
//            outputFile: 'test/report.html'
//        },
//        coverageReporter: {
//            type : 'html',
//            dir : 'coverage/',
//           file : 'coverage.html'
//        },

        // these need to be in your dev dependencies in package.json
        plugins: [
            "karma-mocha",
            "karma-sinon-chai",
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-safari-launcher',
            'karma-phantomjs-launcher',
            'karma-ie-launcher',
            'karma-htmlfile-reporter',
            'karma-coverage',
            'karma-reporter-spec'
        ]

    });
};