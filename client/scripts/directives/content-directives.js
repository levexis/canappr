(function (angular) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    myApp.filter('cfurlDecode', function() {
        return function ( what) {
            return what ? decodeURIComponent( what ) : what;
        };
    });
    myApp.filter('cftrustUrl', function ($sce,$log) {
        return function(url) {
            $log.debug ('cftrustUrl',url);
            // for debugging trust this one
            $sce.trustAsResourceUrl('http://www.soundjay.com');
            return $sce.trustAsResourceUrl(url);
        };
    });
    myApp.filter('cfSecShow', function (timeUtils) {
        return function( secs) {
            // needs to be a number
            return timeUtils.secShow( secs * 1);
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
    myApp.directive('cdPlayItem', function( xmlService , $window, $compile ,$log, $timeout, domUtils , registryService, timeUtils) {
        var directive = {
            restrict: 'E',
            /* link is called after rendering*/
//do I need to attach fast click for this to work on mobile?
//            fastclick.attach(document.body)

            link : function ( $scope, element, attributes ) {
                var $index = ($scope.$index+'') || '',
                    gapAudio,
                /* track elapsed time for phone gap */
                    ticTock = function () {
                        if ( $scope['audio'+$index].playing ) {
                            $timeout( function () {
//                                update position every second
                                gapAudio.getCurrentPosition( function (pos ) {
                                    // returns -1 initially
                                    if ( pos  && pos > 0) {
                                        $scope['audio' + $index].currentTime = pos;
                                        $scope['audio' + $index].formatTime = timeUtils.secShow (pos);
                                    }
                                    ticTock();
                                });
                            }, 1000 );
                        }
                };
                $log.debug ('playItem',registryService.getConfig( 'isPhonegap' ),'audio' + $index,$scope['audio' + $index],$scope );
                $log.debug ('playItem element',element,attributes );
//                $scope['audio' + $scope.$index].$playlist.push ( { src: attributes.src, type: 'audio/mp3'} );
                $scope['playlist' + $index]= [{ src: attributes.src, type: 'audio/mp3'}];

                /* media player seeking */
                $scope.seekPercentage = function ($event) {
                    var offsetX , percentage;
                    $log.debug('seek event', $event);
                    // handle touch event?
                    if ( $event.changedTouches ) {
                        $event = $event.changedTouches[0];
                    }
                    offsetX = domUtils.offset( angular.element( $event.target ) ).left;
                    percentage = ( ( $event.clientX - offsetX) / $event.target.offsetWidth);
                    $log.debug('seekPercentage',percentage,offsetX);
                    if (percentage <= 1) {
                        return percentage;
                    } else {
                        return 0;
                    }
                };
                // if phonegap need playyer functions
                if ( registryService.getConfig( 'isPhonegap' ) ) {
                    $scope['audio'+$index] = {};
                    $scope['audio'+$index].playing = false;
                    gapAudio = new Media( attributes.src , // jshint ignore:line
                        // success callback at end
                        function audio_success() { $log.debug ("playAudio():Audio Completed"); $scope['audio'+$index].playing = false; },
                        // error callback at end
                        function audio_error(err) { $log.debug ( "playAudio():Audio Error: " + JSON.stringify(err) ); },
                        // status callback at end
                        function audio_status(status) {
                            $log.debug ("playAudio():Audio status: " + status);
/*
                            Media.MEDIA_NONE = 0;
                            Media.MEDIA_STARTING = 1;
                            Media.MEDIA_RUNNING = 2;
                            Media.MEDIA_PAUSED = 3;
                            Media.MEDIA_STOPPED = 4;
                            */
                            if ( status === 2) {
//                                $scope['audio'+$index].duration = gapAudio.getDuration();
//                                $scope['audio'+$index].formatDuration = timeUtils.secShow($scope['audio'+$index].duration);
//                                $scope['audio' + $index].playing = true;
                                ticTock();
                            } else {
                                $scope['audio' + $index].playing = false;
                            }
                        }
                    );
                    $log.debug ( 'gap Audio Create',gapAudio);
                    $scope['audio'+$index].play = gapAudio.play;
                    // convert to ms
                    $scope['audio'+$index].seek = function ( position ) {
                        // this doesn't seem to do much
                        gapAudio.seekTo (position*1000);
                        $scope['audio' + $index].currentTime = position;

                    };
                    $scope['audio'+$index].playPause = function () {
                        $log.debug('playPause',$scope['audio'+$index],gapAudio);
                        if ( $scope['audio'+$index].playing ) {
                            gapAudio.pause();
                            $scope['audio'+$index].playing = false;
                        } else {
                            $scope['audio'+$index].playing = 'buffering';
                            // freezes the app whilst it waits on initial load, use time out so scope is applied
                            $timeout ( function () {
                                gapAudio.play();
                                $scope['audio' + $index].playing = true;
                            } , 100);
                        }
                    };
                    $scope['audio' + $index].currentTime = 0;
                    $scope['audio' + $index].formatTime = timeUtils.secShow(0);
                    $scope['audio'+$index].duration = $scope.item.time;
                }
            },
            template: function ( element, attribute ) {
                var outHTML = '';
                if ( !registryService.getConfig('isPhonegap') ) {
                    // use native media player
                    outHTML += '<audio media-player="audio{{$index}}" data-playlist="playlist{{$index}}">';// ng-show="{{item.file.type === \'audio\'}}">';
                    //                outHTML += '<source src="http://www.soundjay.com/human/fart-01.mp3" type="audio/mp3">';
                    outHTML += '</audio>';
                }
                outHTML += '<div class="ca-wrapper" ng-class="{ \'ca-even\': ($index % 2) !== 0}" >';
                outHTML += '    <p class="ca-content-title {{item.file.type}} ">{{ $index+1 }}. {{item.description}} (<span ng-bind-html="audio{{$index}}.formatTime"></span>)</p>';
                outHTML += '    <div class="ca-play" ng-click="audio{{$index}}.playPause()">';
                outHTML += '        <i class="fa fa-lg" ng-class="{ \'fa-pause\': audio{{$index}}.playing===true ,\'fa-spinner\': audio{{$index}}.playing===\'buffering\', \'fa-spin\': audio{{$index}}.playing===\'buffering\', \'fa-play\': !audio{{$index}}.playing }"></i>';
                outHTML += '    </div>';
                outHTML += '    <div class="ca-progress" ng-click="audio{{$index}}.seek(audio{{$index}}.duration * seekPercentage($event))">';
                outHTML += '        <span class="ca-audio-bar topcoat-progress-bar" ng-style="{ width: audio{{$index}}.currentTime*100/audio{{$index}}.duration + \'%\' }" aria-valuemax="100" aria-valuemin="0" role="progressbar" style="width:0px"></span>';
                outHTML += '    </div>';
                outHTML += '    <div class="ca-duration">{{ item.time | cfSecShow}}</div>';
                outHTML += '</div>';
                $log.debug('audio template',outHTML);
                return outHTML;
            }
        };
        return directive;
    });
})(angular);// jshint ignore:line