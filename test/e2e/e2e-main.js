var chai = require('chai' ),
    chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

// should we set the API url here? Maybe configure the factory?

describe('main', function () {
    it('should start with an intro to the app', function () {
        // don't you just love opensource, fix to protractor phantomjs bug https://github.com/angular/protractor/issues/686
        browser.ignoreSynchronization = true;
        browser.get('index.html');
        expect (element(by.tagName('h1')).getText() ).to.eventually.contain('Medit8');
        browser.ignoreSynchronization = false;
    });
    it('should allow me to select an organization');
    it('should allow me to select a course');
    it('should allow me to select a module');
    it('should allow me to play module content');
    it('should show enable new content');
    it('should show allow users to remove watched content');
    it('should show allow users to choose to autodownload');
    it('should download current and next module content');
    it('should notify when new module available');
});