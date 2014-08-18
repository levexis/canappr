(function (angular , _ , window) {
    "use strict";
    // this can be used to replace the rootScope nonsense
    var myApp = angular.module( 'canAppr' );

    myApp.factory('prefService', function($rootScope , $log, $q ,registryService , fileService , xmlService, moduleService , qutils ) {
        // retrieve from local storage
        var _prefs, _navParams, _courseId, _moduleId, _orgId,
            _isNative = registryService.getConfig('isNative');

        $rootScope.canAppr.prefs = JSON.parse ( window.localStorage.getItem('canAppr.prefs') ) || {
            course : {},
            module : {},
            canDownload : [ 'WIFI','ETHERNET','3G','4G' ]
        };

        function _canDownloadCurry ( options ) {
            if ( _.isArray ( options ) ) {
                return function () {
                    var _canDownload=false;
                    function _checkOption (option ) {
                        if ( navigator.connection.type.toUpperCase() === option.toUpperCase() ) {
                            _canDownload = true;
                        }
                    }
                    options.forEach ( _checkOption );
                    return _canDownload;
                };
            } else {
                return undefined;
            }
        }

        /* watches pref changes, saves and processes certain prefs like downloadable */
        $rootScope.$watch('canAppr.prefs', function ( after, before) {
            if ( !_.isEqual(before,after) ) {
                $log.debug( 'pref change saved', before, after );
                window.localStorage.setItem( 'canAppr.prefs', JSON.stringify( _prefs) );
                if ( registryService.getConfig ('isNative') ) {
                    fileService.canDownload( _canDownloadCurry( after.canDownload ) );
                }
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
            _isNative = registryService.getConfig('isNative');
        }, true);

        // returns number of items added to the queue
        function queueContentFiles( module ) {
            var content,
                playObj = xmlService.toObject( atob( module.playlist ) );
            function queueURL ( item ) {
                if (item.file.type === 'audio' ) {
                    fileService.cacheURL( item.file.src, _courseId, _moduleId + '.mp3' );
                } else {
                    $log.error( 'undrecognised file type', item.type );
                }
            }
            if ( playObj ) {
                content = playObj.organization.course.module.content;
                // expects an array of things to play
                if ( !_.isArray( content ) ) {
                    content = [ content ];
                }
                content.forEach ( queueURL );
                return content.length;
            }
        }

        // returns true if all downloaded, delete or failed
        // false if downloading or pending remaining or not found at all
        // @param modules array or single module definition
        function checkStatus ( modules ) {
            // returns the aggregate status of one of more modules
            var outStatus = true;
            function aggregateStatus( module ) {
                var playObj = xmlService.toObject( atob( module.playlist ) ),
                    content = playObj.organization.course.module.content;
                function _doURLStatus ( item ) {
                    var status = fileService.getStatus( item.file.src );
                    if ( outStatus && ( !status || status === 'downloading'|| status === 'queued' || status === 'pending' ) ) {
                        outStatus = false;
                    }
                }
                if ( !_.isArray( content ) ) {
                    content = [ content ];
                }
                content.forEach ( _doURLStatus );
            }
            if (  typeof modules === 'object' ) {
                if ( !_.isArray ( modules ) ) {
                    modules = [ modules ];
                }
                modules.forEach ( aggregateStatus );
                return outStatus;
            } else {
                return false;
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
                // else based on current navParams
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
             * @returns a promise true if all downloaded, false if files to be downloaded
             *
             */
            checkFiles : function ( courseId , modules ) {
                var deferred;
                courseId = courseId || _courseId;
                if ( _isNative && courseId ) {
                    // could check files and mark as all downloaded if done
                    if ( modules ) {
                        modules.forEach( queueContentFiles );
                        // kick off queue
                        if ( checkStatus (modules ) ) {
                            // todo: how do we get the status of all the files? Another method I think
                            return qutils.resolved(true);
                        } else {
                            fileService.downloadQueued();
                            return qutils.resolved( false );
                        }
                    } else {
                        deferred = $q.defer();
                        moduleService.query ( { courseId : _navParams.course.id } ,
                            function ( modules) {
                                modules.forEach( queueContentFiles );
                                // kick off queue
                                if ( checkStatus (modules ) ) {
                                    // todo: how do we get the status of all the files? Another method I think
                                    deferred.resolve(true);
                                } else {
                                    fileService.downloadQueued();
                                    deferred.resolve( false );
                                }
                            }
                        );
                        return deferred.promise;
                    }
                    // if they are all their then mark module as completely dowloaded?
                    return deferred;
                } else {
                    return qutils.resolved ( false );
                }
            },
            /*
             * checks module status
             * @returns a promise true if all downloaded, false if files to be downloaded
             *
             */
            getModuleStatus: function ( moduleId , module ) {
                var deferred = $q.defer();
                moduleId = moduleId || _moduleId;
                // else based on current navParams
                if ( !moduleId ) {
                    return qutils.resolved( false );
                } else {
                    if ( module) {
                        return deferred.resolve( checkStatus( module ) );
                    } else {
                        moduleService.query ( { id: _navParams.module.id} , function ( result ) {
                            return deferred.resolve( checkStatus( result ) );
                        });
                    }
                    return deferred.promise;
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
                if ( _isNative && moduleId ) {
                    fileService.clearDir( moduleId );
                    // TODO: check files after so its marked in correct state ie downloaded?
                    // or can I just ignore
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

