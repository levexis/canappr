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
                if ( registryService.getConfig ('isNative') === 'boolean' ) {
                    if ( registryService.getConfig ('isNative') ) {
                        _isNative = true;
                        fileService.canDownload( _canDownloadCurry( after.canDownload ) );
                    } else {
                        // if it's not native then no need to init file service so set isReady
                        fileService.canDownload ( null , true);
                    }
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
                findex = 0,
                playObj = xmlService.toObject( atob( module.playlist ) ); // this should be a custom type!
            function queueURL ( item ) {
                if (  item.file && item.file.type === 'audio' ) {
                    fileService.cacheURL( decodeURIComponent(item.file.url), module.courseId , module.id + '-' + findex + '.mp3' );
                    findex += 1;
                } else {
                    $log.error( 'unrecognised file type', item.type );
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
        // clears all the files in a module
        function _clearFiles( module ) {
            var content,
                promises = [],
                playObj = xmlService.toObject( atob( module.playlist ) ); // this should be a custom type!
            function clearURL ( item ) {
                if ( item.file.url ) {
                    promises.push( fileService.clearFile( decodeURIComponent( item.file.url ) ) );
                }
            }
            if ( playObj ) {
                content = playObj.organization.course.module.content;
                // expects an array of things to play
                if ( !_.isArray( content ) ) {
                    content = [ content ];
                }
                content.forEach ( clearURL );
                return $q.all(promises);
            } else {
                // nothing found
                qutils.resolved( false );
            }
        }

        // returns true if all downloaded, delete or failed
        // false if downloading or pending remaining or not found at all
        // @param modules array or single module definition
        function _checkStatus ( modules , allCached) {
            // returns the aggregate status of one of more modules
            var outStatus = true;
            function aggregateStatus( module ) {
                var playObj = xmlService.toObject( atob( module.playlist ) ),
                    content = playObj.organization.course.module.content;
                function _doURLStatus ( item ) {
                    var status = fileService.getStatus( decodeURIComponent( item.file.url ) );
                    // return true if cached or deleted unless all cacehed in which case only true if in cache
                    // all other downloading , queued etc returns false
                    if ( outStatus && ( !status || ( status !== 'cached' &&
                        (status !== 'deleted' || allCached) ) ) ) {
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
                        this.checkCourseFiles( courseId , modules );
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
            checkCourseFiles : function ( courseId , modules ) {
                var deferred;
                courseId = courseId || _courseId;
                if ( _isNative && courseId ) {
                    // could check files and mark as all downloaded if done
                    if ( modules ) {
                        if ( !_.isArray ( modules ) ) {
                            modules = [ modules ];
                        }
                        modules.forEach( queueContentFiles );
                        // kick off queue
                        if ( _checkStatus (modules ) ) {
                            // todo: how do we get the status of all the files? Another method I think
                            return qutils.resolved(true);
                        } else {
                            fileService.downloadQueued();
                            return qutils.resolved( false );
                        }
                    } else {
                        deferred = $q.defer();
                        moduleService.query ( { courseId : courseId } ,
                            function ( modules) {
                                 modules.forEach( queueContentFiles );
                                // kick off queue
                                if ( _checkStatus (modules ) ) {
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
             * master method that checks for files for all courses
             * will find new files and download accordingly
             * updates status for each course if new files found
             * @returns a promise that resolves to isDownloaded for all files
             */
            checkFiles : function () {
                var _self = this,
                    all = [],
                    deferred;

                _.keys(_prefs.course ).forEach ( function ( courseId ) {
                    all.push( _self.checkCourseFiles( courseId ) );
                });
                if ( all.length ) {
                    deferred = $q.defer();
                    // when they are all resolved then return true if no false results
                    $q.all(all , function ( results ) {
                        var out = true;
                        results.forEach( function ( result ) {
                            out = out && result;
                        } );
                        deferred.resolve(out);
                    });
                    return deferred.promise;
                } else {
                    // true if nothing to do
                    return qutils.resolved( true );
                }

            },
            /*
             * checks status of module files, anythingTBD
             * @param string moduleId
             * @param module actual record
             * @param allDownloaded return false if file has been deleted
             * @returns a promise / boolean if module passed in - true if all downloaded, false if files to be downloaded / deleted
             *
             */
            isModuleReady: function ( moduleId , module , allDownloaded ) {
                var deferred = $q.defer();
                moduleId = moduleId || _moduleId;
                // else based on current navParams
                if ( !moduleId ) {
                    return false;
                } else {
                    if ( module) {
                        return _checkStatus( module , allDownloaded );
                    } else {
                        moduleService.query ( { id: moduleId } , function ( module ) {
                            $log.debug( 'is module cb', module)
                            return deferred.resolve ( _checkStatus( module , allDownloaded  ) );
                        });
                        return deferred.promise;
                    }
                }
            },
            // courseId optional or uses navParams
            // @param courseId to unsubscribe from or uses navParams
            // returns a promise
            unsubscribeCourse: function ( courseId ) {
                var _self = this;
                courseId = courseId || _courseId;
                if ( courseId && _prefs.course[ courseId ] ) {
                    _prefs.course[ courseId ].subscribed = false;
                    // remove all files
                    return fileService.clearDir( courseId );
                } else {
                    return qutils.resolved(false);
                }
            },
            /*
             * deletes all the files for current modules
             * @param modules
             * @return promise
             */
            // moduleId optional or uses navParams
            clearFiles: function ( modules ) {
                var deferred,
                    moduleId,
                    promises = [];
                if ( typeof modules === 'object' &&
                   !_.isArray ( modules ) ) {
                    modules = [ modules ];
                }
                if ( _isNative && ( moduleId || modules ) ) {
                    if ( modules ) {
                        modules.forEach( function ( module ) {
                            promises.push( _clearFiles( module ) );
                        });
                        return $q.all(promises);
                    } else {
                        deferred = $q.defer();
                            moduleService.get( {id : moduleId} , function (result) {
                                _clearFiles (result ).then( function () {
                                    deferred.resolve( moduleId );
                                });
                            } , qutils.promiseError (deferred, 'get module ' + moduleId)
                        );
                        return deferred.promise;
                    }
                } else {
                    return qutils.resolved( false );
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
            // optional courseId otherwise will use current navParams
            isSubscribed: function (courseId) {
                courseId = courseId || _courseId;
                return  !!( courseId && _prefs.course[ courseId ] && _prefs.course[ courseId ].subscribed );
            },
            /*
             * returns true if all files for a module have been download
             * @param module compulsary
             * @return is syncronous true if donwload, false if not
             */
            isDownloaded: function ( module ) {
                if ( module && module.id ) {
                    return this.isModuleReady( module.id , module, true);
                } else {
                    $log.debug( 'requires module data' );
                    return false;
                }
            }

        };
    });

})(angular , _ , window);//jshint ignore:line

