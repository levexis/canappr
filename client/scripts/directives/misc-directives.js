(function (angular) {
    'use strict';
    var myApp = angular.module( 'daddyswork' , []);
    // requires clippy,swf in same (home) directory
    //<dw-clip copy-text="{{model.out}}"></dw-clip>
    myApp.directive('dwClip', function ( xmlService ) {
        /*jshint multistr: true */
        var template = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"\
        width="110"\
        height="14"\
        id="clippy" >\
        <param name="movie" value="clippy.swf"/>\
        <param name="allowScriptAccess" value="always" />\
        <param name="quality" value="high" />\
        <param name="scale" value="noscale" />\
        <param NAME="FlashVars" value="text={{copyText}}">\
        <param name="bgcolor" value="white">\
        <embed src="clippy.swf"\
        width="110"\
        height="14"\
        name="clippy"\
        quality="high"\
        allowScriptAccess="always"\
        type="application/x-shockwave-flash"\
        pluginspage="http://www.macromedia.com/go/getflashplayer"\
        FlashVars="text={{copyText}}"\
        bgcolor="#FFF" />\
        </object>';

        return {

            link:function(scope, element, attrs) {
                // replaces last copy with new one on chanege
                function textChange( newValue ) {
                    var strTemplate = template.replace(/\{\{copyText\}\}/g, attrs.copyText),
                        last = element.find('object');
                    if (last.length) {
                        last[0].remove();
                    }
                    element.append(strTemplate);
                }
                attrs.$observe('copyText',textChange);
            },
            restrict: 'E'
        };

    });
})( angular );//jshint ignore:line