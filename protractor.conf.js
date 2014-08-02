exports.config = {
    specs: [
        'test/e2e/*.js'
    ],
    baseUrl: 'http://localhost:9000',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    chromeOnly: false,
    capabilities: {
        browserName: 'phantomjs',
        version: '',
        platform: 'ANY'
    },
    seleniumServerJar: null,
    chromeDriver: './selenium/chromedriver',
    framework: 'mocha',
    mochaOpts: {
        reporter: "spec",
        slow: 3000,
        timeout: 1000
    },
    rootElement: 'body',
    allScriptsTimeout: 60000
};