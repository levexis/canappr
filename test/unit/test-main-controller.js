var expect = chai.expect;

describe('test of tests', function () {
    beforeEach(module('canAppr'));

/*    describe('reverse', function () {
        it('should reverse a string', inject(function (reverseFilter) {
            expect(reverseFilter('ABCD')).to.equal('DCBA');
            expect(reverseFilter('jonh')).to.equal('hnoj');
        }));
    });
    */
    it('should pass',function () {
        expect(true).to.equal(true);
    });


});