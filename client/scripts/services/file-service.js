(function ( angular , _) {
    "use strict";
    // this can be used to replace the rootScope nonsense
    var myApp = angular.module( 'canAppr' );

    myApp.factory( 'fileService', function ( $rootScope, $log , $q, $timeout , $window, qutils) {

        /**

         Based on https://github.com/torrmal/cordova-simplefilemanagement/
         Copyright (c) 2014 torrmal:Jorge Torres, jorge-at-turned.mobi
         requires
         https://git-wip-us.apache.org/repos/asf/cordova-plugin-file.git
         https://git-wip-us.apache.org/repos/asf/cordova-plugin-file-transfer.git

         */
        var _dirCache = {},
            _fileManager,
            _dirManager,
            _fileTable = {},
            APP_DIR='file-service',// this is where files are stored, should be set to something app specific on  init
            // store files on external storage or in library directory on IOS, else they show up in itunes!
            LOCAL_ROOT,
            _cancel,
            _isDownloading,
            _isReady = false, // only ready once file table loaded
            DOWNLOAD_WAIT_MAX = 5*60*1000,// max 5 mins waiting for download to finish for a download and wait request
            _canDownload = ( typeof navigator.onLine !== 'undefined' ) ? function () { return navigator.onLine; } : undefined;
        try {
            var tmp = $window.LocalFileSystem.PERSISTENT;
            tmp = null;
        }
        catch ( e ) {
            var LocalFileSystem = {PERSISTENT : $window.PERSISTENT, TEMPORARY : $window.TEMPORARY};
            $window.requestFileSystem = $window.requestFileSystem || $window.webkitRequestFileSystem;
        }
        // used by FileManager and Debug Manager to log what it's doing, still quite noisy!
        var Log = function ( bucket, tag ) {
            return function ( message ) {
                if ( typeof bucket !== 'undefined' && bucket ) {
                    $log.debug( ' ' + bucket + ':' );
                }
                if ( typeof tag !== 'undefined' && tag ) {
                    $log.debug( ' ' + tag + ':' );
                }
                if ( typeof message !== 'object' ) {
                    $log.debug( '       ' + message );
                }
                else {
                    $log.debug( message );
                }
            };
        };
        // Directory Manager Object
        var DirManager = function () {

            var current_object = this;
            // recursive create
            this.create_r = function ( path, callback, fail, position ) {
                position = (typeof position === 'undefined') ? 0 : position;

                var path_split = path.split( '/' );
                var new_position = position + 1;
                var sub_path = path_split.slice( 0, new_position ).join( '/' );

                Log( 'DirManager', 'mesg' )( 'path:' + sub_path, 'DirManager' );

                var inner_callback = function ( obj ) {
                    return function () {
                        Log( 'DirManager', 'mesg' )( 'inner_callback:' + path );
                        obj.create_r( path, callback, fail, new_position );
                    };
                };

                if ( new_position === path_split.length ) {
                    this.create( sub_path, callback, fail );
                }
                else {
                    this.create( sub_path, inner_callback( this ), fail );
                }

            };

            this.list = function ( path, success, fail ) {

                fail = (typeof fail === 'undefined') ? Log( 'DirManager', 'create fail' ) : fail;
                var template_callback = function ( success ) {
                    return function ( entries ) {
                        var i,
                            ret = [],
                            limit = entries.length;

                        for ( i = 0; i < limit; i++ ) {
                            //$log.debug(entries[i].name);
                            ret.push( entries[i].name );
                        }
                        // $log.debug('LIST: '+ret);
                        success( ret );
                    };
                };

                if ( _dirCache[path] ) {
                    _dirCache[path].readEntries(
                        template_callback( success )
                    );
                    return;
                }

                fileSystemSingleton.load(
                    function ( fileSystem ) {
                        var entry = fileSystem.root;
                        entry.getDirectory( path, {create : true, exclusive : false},
                            function ( entry ) {
                                var directoryReader = entry.createReader();
                                _dirCache[path] = directoryReader;
                                directoryReader.readEntries(
                                    template_callback( success )
                                );
                            },
                            function ( err ) {
                                Log( 'DirManager', 'create fail' )( 'error creating directory trying recursive' );
                                current_object.create_r( path, function () {
                                    success( [] );
                                }, fail );
// tries a recursive create next
//                                if (typeof fail === 'function') fail (err);
                            }
                        );
                    }
                );
            };

            this.create = function ( path, callback, fail ) {
                // this is the callback function to use
                fail = (typeof fail === 'undefined') ? Log( 'DirManager', 'create fail' ) : fail;
                fileSystemSingleton.load(
                    function ( fileSystem ) {
                        var entry = fileSystem.root;
                        entry.getDirectory( path, {create : true, exclusive : false},
                            function ( entry ) {
                                Log( 'FileSystem', 'msg' )( 'Directory created successfuly : ' + path );
                                callback( entry );
                            },
                            function ( err ) {
                                Log( 'DirManager', 'create fail' )( 'error creating directory' + path );
                                fail( err );
                            }
                        );
                    }
                );
            };

            this.remove = function ( path, success, fail ) {
                fail = (typeof fail === 'undefined') ? Log( 'DirManager', 'create fail' ) : fail;
                success = (typeof success === 'undefined') ? Log( 'DirManager', 'create fail' ) : success;
                // this should just remove the cache entry
                /* TODO: There needs to be one cache between both objects
                         or you delete a dir and recreate a file and that file does not show up! */
                //
                delete _dirCache[path]; // this should force a refresh on next list
                this.create(
                    path,
                    function ( entry ) {
                        // this should remove the rest
                        // and now remove the rest
                        $log.debug('remove recursively',entry);
                        entry.removeRecursively( success, fail );
                    }
                );
            };

        };
        // used to create file system handle shared between FileManager and DirManager options
        var fileSystemSingleton = {
            fileSystem : false,
            load : function ( callback, fail ) {
                fail = (typeof fail === 'undefined') ? Log( 'FileSystem', 'load fail' ) : fail;
                if ( fileSystemSingleton.fileSystem ) {
                    callback( fileSystemSingleton.fileSystem );
                    return;
                }
                if ( !$window.requestFileSystem ) {
                    return fail();
                }

                $window.requestFileSystem(
                    $window.LocalFileSystem.PERSISTENT,
                    0,
                    function ( fileSystem ) {
                        fileSystemSingleton.fileSystem = fileSystem;
                        // set the root file LOCAL_ROOT is done in fileService.init() but have left old default to data Directory
                        fileSystemSingleton.fileSystem.root.nativeURL = LOCAL_ROOT || $window.cordova.file.dataDirectory;
                        callback( fileSystemSingleton.fileSystem );
                    },
                    function ( err ) {
                        Log( 'FileSystem', 'load fail' )( 'error loading file system' );
                        fail( err );
                    }
                );
            }
        };
        // FileManager Object
        var FileManager = function () {

            this.get_path = function ( todir, tofilename, success, fail ) {
                fail = (typeof fail === 'undefined') ? Log( 'FileManager', 'read file fail' ) : fail;
                this.load_file(
                    todir,
                    tofilename,
                    function ( fileEntry ) {
                        var sPath = fileEntry.toURL();
                        success( sPath );
                    },
                    Log( 'fail' )
                );
            };

            this.load_file = function ( dir, file, success, fail, dont_repeat ) {
                if ( !dir || dir === '' ) {
                    Log( 'error', 'msg' )( 'No file should be created, without a folder, to prevent a mess' );
                    fail();
                    return;
                }
                fail = (typeof fail === 'undefined') ? Log( 'FileManager', 'load file fail' ) : fail;
                var full_file_path = dir + '/' + file;
                var object = this;
                fileSystemSingleton.load(
                    function ( fs ) {
                        var dont_repeat_inner = dont_repeat;
                        // get file handler
                        $log.debug( 'fsroot', fs.root );
                        // clear directory cache as we'll create a file if not already there
                        delete _dirCache[dir];
                        fs.root.getFile(
                            full_file_path,
                            {create : true, exclusive : false},
                            success,
                            function ( error ) {
                                if ( dont_repeat_inner === true ) {
                                    Log( 'FileManager', 'error' )( 'recurring error, gettingout of here!' );
                                    return;
                                }
                                // if target folder does not exist, create it
                                if ( error.code === 3 || error.code === 9 || error.code === 1000 ) {
                                    Log( 'FileManager', 'msg' )( 'folder does not exist, creating it' );
                                    var a = new DirManager();
                                    a.create_r(
                                        dir,
                                        function () {
                                            Log( 'FileManager', 'mesg' )( 'trying to create the file again: ' + file );
                                            object.load_file( dir, file, success, fail, true );
                                        },
                                        fail
                                    );
                                    return;
                                }
                                fail( error );
                            }
                        );
                    }
                );
            };

            this.download_file = function ( url, todir, tofilename, success, fail, options, trustAllHosts ) {
                fail = (typeof fail === 'undefined') ? Log( 'FileManager', 'read file fail' ) : fail;
                options = (typeof options === 'undefined') ? {} : options;
                trustAllHosts = (typeof trustAllHosts === 'undefined') ? false : (trustAllHosts === true);
                this.load_file(
                    todir,
                    tofilename,
                    function ( fileEntry ) {
                        var sPath = fileEntry.toURL();
                        var fileTransfer = new $window.FileTransfer();
                        fileEntry.remove();
                        fileTransfer.download(
                            encodeURI( url ),
                            sPath,
                            function ( theFile ) {
                                delete _dirCache[todir];
                                $log.debug( "download complete: " + theFile.toURL() );
                                success( theFile );
                            },
                            function ( error ) {
                                $log.debug( "download error source " + error.source );
                                $log.debug( "download error target " + error.target );
                                $log.debug( "upload error code: " + error.code );
                                fail( error );
                            },
                            trustAllHosts,
                            options
                        );
                    },
                    fail
                );
            };

            this.read_file = function ( dir, filename, success, fail ) {
                // $log.debug(dir);
                fail = (typeof fail === 'undefined') ? Log( 'FileManager', 'read file fail' ) : fail;
                this.load_file(
                    dir,
                    filename,
                    function ( fileEntry ) {
                        fileEntry.file(
                            function ( file ) {
                                var reader = new FileReader();
                                reader.onloadend = function ( evt ) {
                                    success( evt.target.result );
                                };
                                reader.readAsText( file );
                            },
                            fail
                        );
                    },
                    fail
                );
            };

            this.write_file = function ( dir, filename, data, success, fail ) {
                fail = (typeof fail === 'undefined') ? Log( 'FileManager', 'write file fail' ) : fail;
                this.load_file(
                    dir,
                    filename,
                    function ( fileEntry ) {
                        fileEntry.createWriter(
                            function ( writer ) {
                                delete _dirCache[dir];
                                Log( 'FileManager', 'mesg' )( 'writing to file: ' + filename );
                                writer.onwriteend = function ( evt ) {
                                    Log( 'FileManager', 'mesg' )( 'file write success!' );
                                    if (typeof success === 'function') {
                                        success( evt );
                                    }
                                };
                                writer.write( data );
                            },
                            fail
                        );
                    },
                    fail
                );
            };

            this.remove_file = function ( dir, filename, success, fail ) {
                var full_file_path = dir + '/' + filename;
                fileSystemSingleton.load(
                    function ( fs ) {
                        // get file handler
                        fs.root.getFile( full_file_path, {create : false, exclusive : false}, function ( fileEntry ) {
                            fileEntry.remove( success, fail );
                            delete _dirCache[dir]; // this should force a refresh on next list
                        }, fail );
                    }
                );
            };
        };
        /* Commented out as seems to be unused, there are no docs to say why / whether it worked.
        var ParallelAgregator = function ( count, success, fail, bucket ) {
            ////System.log('success: aggregator count:'+count);
            var success_results = [];
            var fail_results = [];
            var success_results_labeled = {};
            var ini_count = 0;
            var log_func = function ( the_data ) {
                //$log.debug(the_data)
            };
            var object = this,
                current_bucket = (typeof bucket === 'undefined') ? 'aggregator' : bucket;
            var success_callback = (typeof success === 'undefined') ? log_func : success;
            var fail_callback = (typeof fail === 'undefined') ? log_func : fail;

            this.success = function ( label ) {
                return function ( result ) {
                    //System.log('one aggregator success!',current_bucket);
                    ini_count++;
                    success_results.push( result );
                    if ( !success_results_labeled[label] ) {
                        success_results_labeled[label] = [];
                    }
                    success_results_labeled[label].push( result );
                    //System.log('success: aggregator count:'+ini_count,current_bucket);
                    object.call_success_or_fail();
                };
            };

            this.call_success_or_fail = function () {
                if ( ini_count === count ) {
                    //System.log('aggregator complete',current_bucket);
                    if ( success_results.length === count ) {
                        //System.log('aggregator success',current_bucket);
                        success_callback( success_results_labeled );
                    }
                    else {
                        //System.log('aggregator fail',current_bucket);
                        fail_callback( {success : success_results, fail : fail_results} );
                    }
                }
            };

            this.fail = function ( result ) {
                //System.log('one aggregator fail!',current_bucket);
                ini_count++;
                fail_results.push( result );
                //System.log('fail: aggregator count:'+ini_count, current_bucket);
                this.call_success_or_fail();
            };
        };
        */

// End of code from https://github.com/torrmal/cordova-simplefilemanagement/
// file table could be a service, it is saved to local directory specified on init so we know which urls are downloaded to where.
// or at least an object so when values are get or set it saves / flushes to disk.
        /*
         * @private
         * gets contents of file table
         * @returns promise that resolves once table loaded
         */
        function _getTable () {
            var deferred = $q.defer();
            _fileTable = _fileTable || {};
            _fileManager.read_file( APP_DIR , 'file_table.txt' ,
                function ( table ) {
                    if ( table ) {
                        // need to extend existing object as otherwise will destroy refences and cause initialisation problems
                        // where it will redownload the files
                        _.extend(_fileTable , JSON.parse( table ) );

                    }
                    deferred.resolve( table );
                    _isReady = true;
                },
                qutils.promiseError (deferred,'FT load failure')
            );
            return deferred.promise;
        }
        /*
         * @private
         * saves file table
         * @returns a promise that resolves on save
         */
        function _saveTable () {
            var deferred = $q.defer();
            _fileManager.write_file( APP_DIR ,
                'file_table.txt' ,
                JSON.stringify (_fileTable),
                qutils.promiseSuccess(deferred),
                qutils.promiseError(deferred,'FT save failure')
            );
            return deferred.promise;
        }
        /*
         * returns an array of files that match the expression
         * @param key to search for
         * @param value that must match if to be added to results
         * @return array of module elements
         * @private
         */
        //
        function getFiles ( key , value ) {
            var _outArr = [];
            function _addMatch ( url ) {
                var obj = _fileTable[url];
                if ( obj[key] === value ) {
                    // url is added back onto element
                    _outArr.push( _.extend( obj, {url : url} ) );
                }
            }
            _.keys (_fileTable ).forEach ( _addMatch );
            return _outArr;
        }

// TODO: Only over wifi?
// TODO: Donwload multiple files at once?
        return {
            /*
             * inits file service
             * should be called on device ready to initialize module
             * @param app_dir
             * @returns {promise} resolves to true if sucessful false if not
             */
            init : function init ( app_dir ) {
                var failed,
                    _self = this,
                    deferred = $q.defer();
                LOCAL_ROOT = $window.cordova.file.externalDataDirectory || $window.cordova.file.dataDirectory;
                _dirManager = new DirManager();
                _fileManager = new FileManager();
                APP_DIR = (app_dir || APP_DIR );
                // populate file table and start downloads
                _getTable().then( function (table) {
                    deferred.resolve( true );
                    // start download queue
                    if ( _.keys( table ) ) {
                        _self.downloadQueued();
                    }
                }, qutils.promiseError (deferred, 'FS init error') );
                // expose raw fileManager for debugging!
                $window.fileManager = _fileManager;
                $window.dirManager = _dirManager;
                //_cancel = false;  TODO: not implemented cancel yet
                // should not be already downloading anything, fail files that have been downloading
                if ( !_isDownloading ) {
                    failed = getFiles( { status : 'downloading' } );
                    failed.forEach ( function ( failure ) {
                        failure.status = 'failed';
                    });
                }
                _isDownloading = false;
                return deferred.promise;
            },
            /*
             * gets URL to use
             * @param {string} target url
             * @returns {string} will return local url if already cached or target url if not cached
             */
            getURL : function (url) {
                if ( url && _fileTable[url] && _fileTable[url].status === 'cached') {
                    return _fileTable[url].local;
                } else {
                    return url;
                }
            },
            /* cache if not already in file system
                @param {string} URL
                @param {string} directory
                @param {string} filename to use
                @returns {string || boolean} returns local URL if in cache of false if not cached or no url passed;
            */
// this could be more elegent re status etc. Maybe a FileCache object with proper methods
            cacheURL  : function ( url, dir , name) {
                if ( url ) {
                    if ( _fileTable[url] && _fileTable[url].status === 'cached' ) {
                        return _fileTable[url].local;
                    } else {
                        if ( !_fileTable[url] && dir && name) {
                            _fileTable[url] = {
                                dir : dir,
                                filename : name
                            };
                        }
                        if ( _fileTable[url] && (!_fileTable[url].status ||_fileTable[url].status === 'failed') ) {
                            _fileTable[url].status = 'queued';
                             _saveTable();
                            this.downloadQueued();
                        }
                    }
                }
                return false;
            },
            /*
             * download and wait
             * if already downloading then polls every 5 seconds for completed download if already downloading
             * @param {string} url to download
             * @param {string} dir directory to download it to
             * @name {string} filename to use
             * @returns {object} promise that resolves to local filename on completion
             */
            downloadURL : function ( url, dir , name) {
                var deferred,
                    // manuel is our waiter
                    manuel,
                    startTime = new Date(),
                    _self = this;
                if ( url && _fileTable[url] && _fileTable[url].status === 'cached') {
                    return qutils.resolved(_fileTable[url].local );
                } else if ( this.canDownload() ) {
                    deferred = $q.defer();
                    if ( !_fileTable[url] && dir && name) {
                        _fileTable[url] = {
                            dir : dir,
                            filename : name
                        };
                    }
                    // single download queue for now
                    if ( _fileTable[url] && _fileTable[url].status === 'downloading' ) {
                        // check every 5 seconds to see if download complete
                        deferred = $q.defer();
                        startTime = new Date();
                        manuel = function () {
                            $timeout( function () {
                                if ( _fileTable[url].status === 'cached' ) {
                                    deferred.resolve( _fileTable[url].local );
                                } else if ( _fileTable[url].status === 'failed' ) {
                                    deferred.reject( 'download error' );
                                    // give it 5 mins total before timing out
                                } else if ( new Date().getTime - startTime > DOWNLOAD_WAIT_MAX ) {
                                    // could return the actual URL if online?
                                    deferred.reject( 'timed out after ' + ( new Date().getTime - startTime) + 'ms ');
                                } else {
                                    manuel(url);
                                }
                            }, 5000 );
                        };
                        // call the spanish waiter
                        manuel();
                        return deferred.promise;
                    } else if ( _fileTable[url] && _fileTable[url].status !== 'deleted' && !this.isDownloading() ) {
                        _fileTable[url].status = 'downloading';
                        _isDownloading = true;
                        _fileManager.download_file( url , APP_DIR + '/' + dir , name ,
                            function ( file ) {
                                $log.debug('created file',file);
                                _fileTable[url].status = 'cached';
                                //                            _fileTable[url].local = file.toNativeURL(); not in android need local url
                                // get the filesize, it's not actually a file that is returned!
                                file.file( function ( file ) {
                                    // save in MB to 1 decimal place
                                    _fileTable[url].local = file.localURL;
                                    _fileTable[url].size = (file.size / 1000000 ).toFixed(1);
                                    _saveTable();
                                    deferred.resolve( file.localURL );
                                    _isDownloading = false;
                                    // always tries to download any other queued files
                                    _self.downloadQueued();
                                });
                            },
                            function ( error) {
                                _fileTable[url].status='failed';
                                _saveTable();
                                deferred.reject( error );
                            });
                        return deferred.promise;
                    }
                }
                // can't download, either offline or no directory and filename specified
                return qutils.resolved(url);
            },
            /*
             * downloads file queue, calls itself until queue is empty
             * @param TBD list of files to be downloaded optional
             * @param attempts used for callbacks to prevent death by recursion
             * @returns queue length
             */
            downloadQueued: function ( TBD , attempts ) {
                var queued = TBD || [],
                    next,
                    _self = this,
                    _queueAttempts = attempts || 0;
                if ( !queued.length ) {
                    queued = getFiles( 'status', 'queued' );
                    if ( !queued.length ) {
                        // retry failures
                        queued = getFiles( 'status', 'failed' );
                    }
                }
                if ( queued.length && !_isDownloading && this.canDownload() ) {
                    // should maybe do these in some sort of order, presume shift will be order they were put in
                    next = queued.shift();
                    if ( _queueAttempts < 250 ) {
                        _self.downloadURL( next.url, next.dir, next.filename )
                            .then( function () {
                                // add a little delay so file download failures don't free the screen
                                $timeout ( function () {
                                    _self.downloadQueued( queued , _queueAttempts++ );
                                } ,100 );
                            } );
                    } else {
                        $log.error( _queueAttempts + ' recursions', queued );
                        return false;
                    }
                }
                return queued.length;
            },
            /*
             * clears everything to do with filemanager, including file table so will lose record of what has been "deleted"
             *  @returns a promise
             */
            resetAll : function () {
                _fileTable = {};
                _saveTable();
                return this.clearDir ('');
            },
            /*
             * clears everything to do with filemanager, including file table
             *  @returns a promise
             */
            // clear cache by URL
            clearFile : function (url) {
                if (url && _fileTable[url] && _fileTable[url].status !== 'deleted' ) {
                    var deferred = $q.defer();
                    // this was in callback but have moved out to make testing easier
                    _fileTable[url].status = 'deleted';
                    _fileManager.remove_file( APP_DIR + '/' + _fileTable[url].dir,_fileTable[url].filename,
                        function ( success) {
                            _saveTable();
                            qutils.promiseSuccess( deferred, url + ' cleared' )(success);
                        },
                        qutils.promiseError( deferred ) );
                    return deferred.promise;
                } else {
                    return qutils.resolved( false );
                }
            },
            /*
             * clear cache by directory
             * (effectively an entire module or everything if passed '' )
             * @param {string}
             * @returns {promise} resolves on completion
             */
            clearDir : function (dir) {
                if (typeof dir === 'string') {
                    var deferred = $q.defer(),
                        // delete file table entries that match
                        fileList;
                    if ( dir ) { // dir = '' is special case of resetAll
                        fileList = getFiles( 'dir', dir );
                        fileList.forEach( function ( file ) {
                            delete _fileTable[file.url];
                        } );
                        _saveTable();
                    }
                    _dirManager.remove( APP_DIR + '/' + dir , qutils.promiseSuccess( deferred, dir + ' cleared' ), qutils.promiseError( deferred ) );
                    return deferred.promise;
                } else {
                    return qutils.resolved( false );
                }
            },
            /*
             * gets current status of url in cache
             * @param {string} URL to look for
             * @returns {boolean | string} return false if not find, otherwise status string. status of cached if downloaded and saved
             */
            getStatus  : function (url) {
                if ( url && _fileTable[url] ) {
                    return _fileTable[url].status;
                } else {
                    return false;
                }
            },
            /*
             * sets the url to be redownloaded, can be used to resubscribe or to download, returns false if not foun
             * @param {string} URL to look for
             * @returns {boolean | string} return false if not find, otherwise status string. status of cached if downloaded and saved
             */
            redownload  : function (url) {
                if ( url && _fileTable[url] ) {
                    _fileTable[url].status = 'queued';
                    return true;
                } else {
                    return false;
                }
            },
            /*
             * gets current state of downloadManager
             * @param {boolean} can be used to set isDownloanding for tests
             * @returns {boolean} true if currently downloading
             */
            isDownloading: function (isDownloading) {
                if ( typeof isDownloading === 'boolean' ) {
                    _isDownloading = isDownloading;
                }
                return _isDownloading;
            },
            /*
             * allows fileManager to be access directly or mocked
             * @returns {object} Initialised FileManager instance
             */
            getFileManager: function () {
                return _fileManager;
            },
            /*
             * allows fileManager to be access directly or mocked
             * @returns {object} Initialised DirManager instance
             */
            getDirManager: function () {
                return _dirManager;
            },
            /*
             * sets / returns canDownload flag
             * @param {string | function} Can be set to function or string or nothing to return current state
             * @param {boolean} Allows ready to be set, should only be used for testing
             * @returns {boolean} current status
             */
            canDownload: function ( setFlag , setReady ) {
                if ( typeof setFlag !== 'undefined'&& setFlag !== null ) {
                    _canDownload = setFlag;
                }
                if ( typeof setReady === 'boolean' ) {
                    _isReady = setReady;
                }
                if ( typeof _canDownload === 'function' ) {
                    return _isReady && _canDownload();
                } else {
                    return _isReady && !!_canDownload;
                }
            },
            /*
             * gets the fileTable only use for testing
             * @returns object
             */
            getFileTable: function () {
                return _fileTable;
            }
        };

    } );
})(angular , _); // jshint ignore:line

