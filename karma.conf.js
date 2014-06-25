// basic Karma configuration for e2e testing use, runs once and uses phantomjs
module.exports = function(config) {
    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: '',

        // frameworks to use, these need to be specified in plugins below
        frameworks: [ 'mocha', 'sinon-chai'],

        // list of ALL files / patterns needed by requireJS, if not loaded here will not work later
        files: [
            { pattern: 'www/**/*.js' , included: false },
            { pattern: 'www/**/*.html' , included: false },
            { pattern: 'test/**/*.test.js', included: false},
        ],

        exclude: [
//            'www/js/main.js'
        ],

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['progress', 'dots' ,'html' , 'coverage'], // need to install spec using

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
//        autoWatch: true, not for run once
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        // browsers need to be in plugins below
        browsers: ['PhantomJS'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
//        singleRun: false, // not for run once
        singleRun: true,

        preprocessors : {
            '**/www/*.js': 'coverage'
        },

        htmlReporter: {
            outputFile: 'test/report.html'
        },
        coverageReporter: {
            type : 'html',
            dir : 'coverage/',
            file : 'coverage.html'
        },

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
        'karma-coverage'
    ]

    });
};
