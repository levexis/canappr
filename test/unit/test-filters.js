var expect = chai.expect;


describe('test filters', function() {

    var filter;
    beforeEach(function(){
        // how to run a module!
        module.apply('canAppr');
        inject(function($injector){
            filter = $injector.get('$filter')('number');
        });
    });

    it('should format a number', function(){
        expect(filter('123456')).to.equal('123,456');
    });
});
