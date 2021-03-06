(function (angular) {
    "use strict";
    var myApp = angular.module( 'canAppr' );
    myApp.filter('cfurlDecode', function() {
        return function ( what) {
            return what ? decodeURIComponent( what ) : what;
        };
    });

    // this will get called on each scope cycle which is a lot if the playback is updating current time
    myApp.filter('cftrustUrl', function ($sce,$log) {
        return function(url) {
            return $sce.trustAsResourceUrl(url);
        };
    });
    myApp.filter('cfSecShow', function (timeUtils) {
        return function( secs) {
            // needs to be a number
            return timeUtils.secShow( secs * 1);
        };
    });

    myApp.directive('cdPlayItem', function( xmlService , $window, $compile ,$log, $timeout, domUtils , registryService, timeUtils ,fileService, prefService , analService) {
        var directive = {
            restrict: 'E',

            link : function ( $scope, element, attributes ) {
                // TODO: should this be a controller as it has application caching logic in it
                var $index = ($scope.$index+'') || '',
                    gapAudio,
                    navParams = registryService.getNavModels(),
                    hasBuffered = false, // helps with UI lag on first play
                /* track elapsed time for phone gap */
                    ticTock = function (delay) {
                        delay = delay || 50;
                        if ( $scope['audio'+$index].playing ) {
                            $timeout( function () {
//                                update position every second
                                gapAudio.getCurrentPosition( function (pos ) {
                                    // returns -1 initially for unknown length
                                    if ( pos  && pos > 0) {
                                        $scope['audio' + $index].currentTime = pos;
                                        $scope['audio' + $index].formatTime = timeUtils.secShow (pos);
                                        if ( $scope['audio' + $index].playing === 'buffering' ) {
                                            $scope['audio' + $index].playing = true;
                                        }
                                        // needs to be fast enough so each second is registered
                                        // problem is it triggers a complete digest each time but if not quick enough
                                        // then stutters on mobile. Needs to be fast enough to tick seconds but not so fast as to look like a bad attempt
                                        // at a realtime progressbar animation
                                        delay=500;
                                    }
                                    ticTock(delay);
                                });
                            }, delay );
                        }
                };

                function _setGapAudio ( src ) {
                    // we have to correct local paths for android as currently not supporting a relative path
                    gapAudio = new Media( fileService.checkMediaURL (src ) , // jshint ignore:line
                        // success callback at end
                        function audio_success() {
                            $log.debug( "playAudio():Audio Completed" );
                            $scope['audio' + $index].playing = false;
                            // can we now now copy the file to a temporary cache if from remote?
                        },
                        // error callback at end
                        function audio_error( err ) {
                            $log.debug( "playAudio():Audio Error: " + JSON.stringify( err ) );
                        },
                        // status callback at end
                        function audio_status( status ) {
                            $log.debug( "playAudio():Audio status: " + status );
                            /*
                             Media.MEDIA_NONE = 0;
                             Media.MEDIA_STARTING = 1;
                             Media.MEDIA_RUNNING = 2;
                             Media.MEDIA_PAUSED = 3;
                             Media.MEDIA_STOPPED = 4;
                             */
                            if ( status === 2 ) {
                                // start the clock
                                ticTock();
                            // android ( 4.4 ) returns starting and not running so this branch is android and above is ios
                            } else if ( status ===1 ) {
//                                $scope['audio' + $index].playing = 'buffering';
                                ticTock();
                            } else {
                                $scope['audio' + $index].playing = false;
                            }
                        }
                    );
                    $scope.$on('$destroy', function() {
                        // release media player on destroy
                        $log.debug('releasing audio player', $index,$scope);
                        gapAudio.stop();
                        gapAudio.release();
                    });
                    $log.debug ( 'gap Audio Create',src,gapAudio);
                }
                $log.debug ('playItem',registryService.getConfig( 'isNative' ),'audio' + $index,$scope['audio' + $index],$scope );
                $log.debug ('playItem element',element,attributes );

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
                if ( registryService.getConfig( 'isNative' ) ) {
                    $scope['audio'+$index] = {};
                    $scope['audio'+$index].playing = false;
                    // if they are registered for the course then download before playing
                    // this will do as POC for now!
                    if ( $scope.isSubscribed && fileService.getStatus( attributes.src) !=='deleted'  ) {
                        $scope['audio'+$index].playing = 'buffering';
                        // play from cache if not already downloaded
                        fileService.downloadURL( attributes.src,
                            registryService.getModuleId,
                            registryService.getCourseId + '.mp3' )
                            .then ( function ( localUrl ) {
                                $scope['audio'+$index].playing = false;
                                _setGapAudio( localUrl);
                                $scope['audio'+$index].play = gapAudio.play;
//                                hasBuffered = true;
                        });
                    } else {
                        // direct download
                        _setGapAudio (  attributes.src );
                        // hangs before it plays so display buffering icon
                        $scope['audio'+$index].play = gapAudio.play;
                        hasBuffered = false;
                    }
                    // convert to ms
                    $scope['audio'+$index].seek = function ( position ) {
                        // this doesn't seem to do much
                        gapAudio.seekTo (position * 1000);
                        $scope['audio' + $index].currentTime = position;
                        $scope['audio' + $index].formatTime = timeUtils.secShow ( position );

                    };
                    $scope['audio'+$index].playPause = function () {
                        $log.debug('playPause',$scope['audio'+$index],gapAudio);
                        if ( $scope['audio'+$index].playing !== 'buffering' ) {
                            analService.trackEvent('audio' , 'PlayPause', attributes.src, navParams.module.id);
                            if ( $scope['audio' + $index].playing ) {
                                gapAudio.pause();
                                $scope['audio' + $index].playing = false;
                            } else {
                                $scope['audio' + $index].playing = hasBuffered ? true : 'buffering';
                                // freezes the app whilst it waits on initial load, use time out so scope is applied
                                $timeout( function () {
                                    // this should be set by default but audio is stopping when iphone goes to sleep
                                    gapAudio.play({ playAudioWhenScreenIsLocked: true});
//                                    hasBuffered = true;
                                }, 100 );
                            }
                        }
                    };
                    $scope['audio' + $index].currentTime = 0;
                    $scope['audio' + $index].formatTime = timeUtils.secShow(0);
                    $scope['audio'+$index].duration = $scope.item.time;
                    if ( fileService.getStatus ( attributes.src ) !== 'cached' &&
                        !fileService.canDownload() ) {
                        $scope.notAvailable = true;
                    }
                } else {
                    // web player
                    $scope['playlist' + $index]= [{ src: attributes.src, type: 'audio/mp3'}];
                    $scope.notAvailable = !fileService.canDownload();
                }
            },
            template: function ( element, attribute ) {
                var outHTML = '';
                if ( !registryService.getConfig('isNative') ) {
                    // use native media player
                    outHTML += '<audio media-player="audio{{$index}}" data-playlist="playlist{{$index}}">';// ng-show="{{item.file.type === \'audio\'}}">';
                    //                outHTML += '<source src="http://www.soundjay.com/human/fart-01.mp3" type="audio/mp3">';
                    outHTML += '</audio>';
                }
                outHTML += '<div class="ca-wrapper" ng-class="{ \'ca-even\': ($index % 2) !== 0 , \'ca-not-available\' : notAvailable }" >';
                // also play pause if click on title to play pause as seems play button is too near left for automation to work
                outHTML += '    <p class="ca-content-title {{item.file.type}}" ng-click="pulse=true; audio{{$index}}.playPause()">{{ $index+1 }}. {{item.description}} (<span ng-bind-html="audio{{$index}}.duration -audio{{$index}}.currentTime | cfSecShow"></span>)</p>';
                // have added a pulse to make it obvious something is happening as safari is laggy particularly on ipad etc
                outHTML += '    <div class="ca-play animated" style="animation-duration: 1s; text-align: center" ng-click="pulse=true; audio{{$index}}.playPause()" ng-class="{ \'pulse\' : pulse }">';
                outHTML += '        <i class="fa fa-2x" ng-class="{ \'fa-pause\': audio{{$index}}.playing===true ,\'fa-spinner\': audio{{$index}}.playing===\'buffering\', \'fa-spin\': audio{{$index}}.playing===\'buffering\', \'fa-play\': !audio{{$index}}.playing }">&nbsp;</i>';// have put a nbsp for mobile taps to work
                outHTML += '    </div>';
                outHTML += '    <div class="ca-progress" ng-click="audio{{$index}}.seek(audio{{$index}}.duration * seekPercentage($event))">';
                outHTML += '        <span class="ca-audio-bar topcoat-progress-bar" ng-style="{ width: audio{{$index}}.currentTime*100/audio{{$index}}.duration + \'%\' }" aria-valuemax="100" aria-valuemin="0" role="progressbar" style="width:0px"></span>';
                outHTML += '    </div>';
//                outHTML += '    <div class="ca-duration">{{ item.time | cfSecShow}}</div>';
                outHTML += '</div>';
                return outHTML;
            }
        };
        return directive;
    });
})(angular);// jshint ignore:line