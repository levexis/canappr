var appium = require('appium');
var wd = require('wd');

describe('testing iphone local server', function() {

    it('this', function() {
        console.log('preparing to kill alert');
        browser.driver.switchTo().alert().accept();
        console.log('killed alert');
        browser.driver.getElementsByTagName('UIAWebview').click();
        browser.driver.context('WEBVIEW');
        var body = browser.driver.findElement(protractor.By.id('addWorkdayIcon'));
        body.click();
    });

});
