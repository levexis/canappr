(function (angular) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    myApp.filter('cfurlDecode', function() {
        return function ( what) {
            return what ? decodeURIComponent( what ) : what;
        }
    });
    myApp.filter('cftrustUrl', function ($sce) {
        return function(url) {
            return $sce.trustAsResourceUrl(url);
        };
    });
    /*
    myApp.directive('cdPlaylist', function( xmlService , $window, $compile) {
        var directive = {
            restrict: 'E',
            /*compile : function ( scope, element, attributes ) {
                var _doPlaylist = function ( scope ) {
                    if ( scope.playlist && typeof $window.atob === 'function' ) {
                        var playObj = xmlService.toObject( atob( scope.playlist ) );
                        console.log ('updated playObj',playObj);
                        scope.playObj = playObj;
                    }
                };
                var linkFunction = function ( scope, element, attributes ) {
                    _doPlaylist( scope );
                    scope.$watch( 'playlist', function ( newer, older ) {
                        if (!older || newer !== older) _doPlaylist( scope );
                    } );
                };
                return linkFunction;
            },
            template: function ( element, attribute ) {
                var outHTML = '<div ngShow="{{ !!playlist  }}">';
                outHTML += '<cd-play-item ng-repeat="item in playObj.organization.course.module.content" />';
                outHTML += '</div>';
                return outHTML;
            }
        };
        return directive;
    });
     */
    myApp.directive('cdPlayItem', function( xmlService , $window, $compile ,$log, domUtils) {
        var directive = {
            restrict: 'E',
            /* link is called after rendering*/
//do I need to attach fast click for this to work on mobile?
//            fastclick.attach(document.body)

            link : function ( $scope, element, attributes ) {
                $log.debug ('playItem','audio' + $scope.$index,$scope['audio' + $scope.$index],$scope );
                $log.debug ('playItem element',element,attributes );
//                $scope['audio' + $scope.$index].$playlist.push ( { src: attributes.src, type: 'audio/mp3'} );
                $scope['playlist' + $scope.$index]= [{ src: attributes.src, type: 'audio/mp3'}];

                /* media player seeking */
                $scope.seekPercentage = function ($event) {
                    var offsetX = domUtils.offset(angular.element($event.target)).left,
                        percentage = ( ( $event.clientX - offsetX) / $event.target.offsetWidth);
                    if (percentage <= 1) {
                        return percentage;
                    } else {
                        return 0;
                    }
                };
            },
            template: function ( element, attribute ) {
                var outHTML = '';
                // now add a custom media directive? this doesn't get picked up as scoped in new p
                outHTML += '<audio media-player="audio{{$index}}" data-playlist="playlist{{$index}}">';// ng-show="{{item.file.type === \'audio\'}}">';
//                outHTML += '<source src="http://www.soundjay.com/human/fart-01.mp3" type="audio/mp3">';
                outHTML += '</audio>';
                outHTML += '<div class="ca-wrapper" ng-class="{ \'ca-even\': ($index % 2) !== 0}" >';
                outHTML += '    <p class="ca-content-title {{item.file.type}} ">{{ $index+1 }}. {{item.description}} (<span ng-bind-html="audio{{$index}}.formatTime"></span>)</p>';
                outHTML += '    <div class="ca-play" ng-click="audio{{$index}}.playPause()">';
                outHTML += '        <i class="fa fa-lg" ng-class="{ \'fa-pause\': audio{{$index}}.playing, \'fa-play\': !audio{{$index}}.playing }"></i>';
                outHTML += '    </div>';
                outHTML += '    <div class="ca-progress" ng-click="audio{{$index}}.seek(audio{{$index}}.duration * seekPercentage($event))">';
                outHTML += '        <span class="ca-audio-bar topcoat-progress-bar" ng-style="{ width: audio{{$index}}.currentTime*100/audio{{$index}}.duration + \'%\' }" aria-valuemax="100" aria-valuemin="0" role="progressbar" style="width:0px"></span>';
                outHTML += '    </div>';
                outHTML += '    <div class="ca-duration" ng-bind-html="audio{{$index}}.formatDuration"></div>';
                outHTML += '</div>';
                return outHTML;
            }
        };
        return directive;
    });
})(angular);