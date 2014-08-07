(function (angular , _) {
    "use strict";
    // this can be used to replace the rootScope nonsense
    var myApp = angular.module( 'canAppr' );

    myApp.factory('prefService', function($rootScope ,fileService) {
        // retrieve from local storage
        var _prefs;
        $rootScope.canAppr.prefs = JSON.parse ( window.localStorage.getItem('canAppr.prefs') ) || {
             course: {}
        };
        $rootScope.$watch('canAppr.prefs', function ( before , after) {
            if ( _.isEqual(before,after) ) {
                $log.debug( 'pref change saved', after );
                window.localStorage.setItem( 'canAppr.prefs', JSON.stringify( _prefs) );
            }
        });
        _prefs = $rootScope.canAppr.prefs;
        // which courses am I on
        // which content should be downloaded
        // which content should not be download
        // which content have I consumed - when / how often / when last?
        // final part to jigsaw is filecache, is this where i store the local filename?
        return {
            subscribeCourse: function (courseId) {
                if ( courseId ) {
                    // first time
                    if ( !_prefs.course[ courseId ] ) {
                        _prefs.course[ courseId ] = {};
                    }
                    // resubscribing
                    _prefs.course[ courseId ].subscribed = new Date();
                }
            },
            unsubscribeCourse: function (courseId) {
                if ( courseId  && _prefs.course[ courseId ] ) {
                    _prefs.course[ courseId ].subscribed = false;
                }
            },
            // deletes offline content
            deleteContent: function (courseId , moduleId) {
                if ( courseId && _prefs.course[ courseId ] && _prefs.course[ courseId ][ moduleId ] ) {
                    _prefs.course[ courseId ][ moduleId ].downloaded = false;
// clear all the files
//                    course[courseId][moduleId].files.forEach ( function (file) { delete file.localURL } )
                }
            },
            // track what's been viewed and what hasnt, whats completed etc
            // creates the stub and allows events to be added via the @what param
            setModuleEvent: function (courseId , moduleId , eventName ) {
                if ( courseId && !_prefs.course[ courseId ] )  _prefs.course [ courseId ] = {};
                if ( moduleId && !_prefs.course[ courseId ][moduleId] )  _prefs.course [ courseId ] [ moduleId ] = {};
                if ( eventName ) {
                    _prefs.course [ courseId ] [ moduleId ] [ eventName ] = new Date();
                }
            },
            getEventTime: function (courseId , moduleId , eventName ) {
                if ( courseId &&  moduleId && _prefs.course[ courseId ][moduleId] ) {
                    return _prefs.course [ courseId ] [ moduleId ] [eventName];
                }
            },

            // can be used to download content if deleted offline
            downloadContent: function (courseId , moduleId) {
                if ( courseId && _prefs.course[ courseId ] && _prefs.course[ courseId ][ moduleId] && !_prefs.course[ courseId ][ moduleId ].downloaded  ) {
                    _prefs.course[ courseId ][ moduleId ].downloaded = 'pending';
                }
            },
            // subscribed to a course
            isSubscribed: function ( courseId) {
                if ( courseId && _prefs.course[ courseId ] && _prefs.course[ courseId ].subscribed ) {
                    return true;
                } else {
                    return false;
                }
            },
            // downloaded all the files for a module?
            isDownloaded: function ( courseId , moduleId ) {
                if ( courseId && _prefs.course[ courseId ] && _prefs.course[ courseId ][ moduleId ]  ) {
                    // just return download flag for now
                    return _prefs.course[ courseId ][ moduleId ].downloaded;
                }
            }

        };

    });

})(angular , _);

