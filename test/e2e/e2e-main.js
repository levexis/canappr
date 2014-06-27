var chai = require('chai' ),
    chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('main', function () {

    it('It should say something about canAppr', function () {
        // don't you just love opensource, fix to protractor phantomjs bug https://github.com/angular/protractor/issues/686
        browser.ignoreSynchronization = true;
        browser.get('index.html');
        expect (element(by.tagName('h1')).getText() ).to.eventually.contain('canAppr');
        browser.ignoreSynchronization = false;
    });

});