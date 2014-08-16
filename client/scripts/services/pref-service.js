(function (angular , _ , window) {
    "use strict";
    // this can be used to replace the rootScope nonsense
    var myApp = angular.module( 'canAppr' );

    myApp.factory('prefService', function($rootScope , $log, registryService ,  fileService , xmlService, moduleService ) {
        // retrieve from local storage
        var _prefs, _navParams, _courseId, _moduleId, _orgId,
            _isMobile = registryService.getConfig('isPhoneGap');

        $rootScope.canAppr.prefs = JSON.parse ( window.localStorage.getItem('canAppr.prefs') ) || {
            course : {},
            module : {}
        };

        $rootScope.$watch('canAppr.prefs', function ( after, before) {
            if ( !_.isEqual(before,after) ) {
                $log.debug( 'pref change saved', before, after );
                window.localStorage.setItem( 'canAppr.prefs', JSON.stringify( _prefs) );
            }
        // don't forget object comparison
        }, true);
        _prefs = $rootScope.canAppr.prefs;
        _navParams = registryService.getNavModels();
        $rootScope.$watch('canAppr.navParams', function () {
            _courseId = registryService.getCourseId ();
            _moduleId = registryService.getModuleId ();
            _orgId =_navParams.org.id+'';
            // this is refreshed here to make it possible to set for karma testing
            _isMobile = registryService.getConfig('isPhoneGap');
        }, true);

        // returns number of items added to the queue
        function queueContentFiles( module ) {
            var content,
                playObj = xmlService.toObject( atob( module.playlist ) );
            function queueURL ( item ) {
                fileService.cacheURL( item.src , _courseId , _moduleId + 'mp3' );
            }
            if ( playObj ) {
                content = playObj.organization.course.module.content;
                // expects an array of things to play
                if ( !_.isArray( content ) ) {
                    content = [ content ];
                }
                content.forEach ( queueURL );
                // kick of queue
                fileService.downloadQueued();
                return content.length;
            }
        }

        // returns a string of org-course

        // which courses am I on
        // which content should be downloaded
        // which content should not be download
        // which content have I consumed - when / how often / when last?
        // final part to jigsaw is filecache, is this where i store the local filename?
        return {
            // if passed modules then will queue all the files for download
            subscribeCourse: function ( courseId , modules ) {
                courseId = courseId || _courseId;
                // all based on current navParams
                if ( courseId ) {
                    // first time
                    if ( !_prefs.course[ courseId ] ) {
                        _prefs.course[ courseId ] = {};
                    }
                    if (typeof _prefs.course[ courseId ].subscribed !== 'object' ) {
                        _prefs.course[ courseId ].subscribed = new Date();
                    }
                    if ( modules ) {
                        this.checkFiles( courseId , modules );
                    }
                }
            },
            /*
             * checks if files have been downloaded or new files for download
             * updates status for module if all downloaded
             * adds new modules
             */
            checkFiles : function ( courseId , modules ) {
                if ( _isMobile ) {
                    // could check files and mark as all downloaded if done
                    if ( modules ) {
                        modules.forEach( queueContentFiles );
                    }
                    // if they are all their then mark module as completely dowloaded?
                } else {
                    return false;
                }
            },
            // courseId optional or uses navParams
            unsubscribeCourse: function ( courseId) {
                courseId = courseId || _courseId;
                if ( courseId && _prefs.course[ courseId ] ) {
                    _prefs.course[ courseId ].subscribed = false;
                    // remove all files
                    // TODO: this needs looking at as throws an error if not on phonegap
//                    if ( refileService.clearDir ( courseId );
                }
            },
            // moduleId optional or uses navParams
            clearFiles: function ( moduleId) {
                moduleId = moduleId || _moduleId;
                if ( _isMobile && moduleId ) {
                    fileService.clearDir( moduleId );
                } else {
                    return false;
                }
            },
            // track what's been viewed and what hasnt, whats completed etc
            // creates the stub and allows events to be added via the @what param
            setModuleEvent: function ( eventName ,moduleId ) {
                moduleId = moduleId || _moduleId;
                if ( moduleId && !_prefs.module[moduleId] ) {
                    _prefs.module [ moduleId ] = {};
                }
                if ( eventName && moduleId ) {
                    _prefs.module [ moduleId ] [ eventName ] = new Date();
                }
            },
            getEventTime: function (eventName , moduleId ) {
                moduleId = moduleId || _moduleId;
                if ( _moduleId && _prefs.module[_moduleId ] ) {
                    return _prefs.module [ _moduleId ] [eventName];
                } else {
                    return false;
                }
            },
            // sets the flag to say content has been downloaded - should it broadcast an event?
            // takes a parameter as this can be called outside of service
            fileDownloaded: function ( moduleId ) {
                // TODO: Have removed this from download file-service
                // TODO this should maybe be a callback function and separated out
                // prefService.fileDownloaded ( dir , url );

                // TODO: this will need to check all files for a module content are in the filecache
                // but at the moment it's one file per module so we can cheet
                moduleId = moduleId || _moduleId;
                if ( moduleId) {
                    if (  !_prefs.module[moduleId] ) {
                        _prefs.module [ moduleId ] = {};
                    }
                    if ( typeof _prefs.module[ moduleId ].downloaded !== 'object' ) {
                        _prefs.module[ moduleId ].downloaded = new Date();
                    }
                }
            },
            // optional courseId otherwise will use current navParams
            isSubscribed: function (courseId) {
                courseId = courseId || _courseId;
                return  !!( courseId && _prefs.course[ courseId ] && _prefs.course[ courseId ].subscribed );
            },
            // returns true if all files for module have been download
            isDownloaded: function ( ) {
                // should be a date, ie an object will do
                return !!(_moduleId &&  typeof _prefs.module[ _moduleId ].downloaded === 'object');
            },
            // indicates a file has been removed, this allows for it to be manually downloaded
            wasDeleted: function ( ) {
                return !!(_moduleId &&  typeof _prefs.module[ _moduleId ].downloaded === false);
            }
        };

    });

})(angular , _ , window);//jshint ignore:line

