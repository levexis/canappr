(function ( angular ) {
    "use strict";
    // this can be used to replace the rootScope nonsense
    var myApp = angular.module( 'canAppr' );

    myApp.factory( 'fileService', function ( $rootScope, $log , $q) {

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
            APP_DIR='',
            // store files on external storage or in library directory on IOS, else they show up in itunes!
            LOCAL_ROOT;

        try {
            var tmp = window.LocalFileSystem.PERSISTENT;
            tmp = null;
        }
        catch ( e ) {
            var LocalFileSystem = {PERSISTENT : window.PERSISTENT, TEMPORARY : window.TEMPORARY};
            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        }

        var Log = function ( bucket, tag ) {
            return function ( message ) {
                if ( typeof bucket !== 'undefined' ) {
                    $log.debug( ' ' + bucket + ':' );
                }
                if ( typeof tag !== 'undefined' ) {
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

        var fileSystemSingleton = {
            fileSystem : false,
            load : function ( callback, fail ) {
                fail = (typeof fail === 'undefined') ? Log( 'FileSystem', 'load fail' ) : fail;
                if ( fileSystemSingleton.fileSystem ) {
                    callback( fileSystemSingleton.fileSystem );
                    return;
                }
                if ( !window.requestFileSystem ) {
                    return fail();
                }

                window.requestFileSystem(
                    window.LocalFileSystem.PERSISTENT,
                    0,
                    function ( fileSystem ) {
                        fileSystemSingleton.fileSystem = fileSystem;
                        // set the root file path
                        fileSystemSingleton.fileSystem.root.nativeURL = window.cordova.file.dataDirectory;
                        callback( fileSystemSingleton.fileSystem );
                    },
                    function ( err ) {
                        Log( 'FileSystem', 'load fail' )( 'error loading file system' );
                        fail( err );
                    }
                );
            }
        };

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
                        var fileTransfer = new window.FileTransfer();
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
        /* not sure what this, not being used? */
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


// file table should be a service
        function _getTable () {
            _fileManager.read_file( APP_DIR , 'file_table.txt' ,
                function ( table ) {
                    if ( table ) {
                        _fileTable = JSON.parse( table );
                    } else {
                        _fileTable = {};
                    }
                    window.fileTable = _fileTable;
                    $log.debug('fileTable',_fileTable);
                });
        }

        function _saveTable () {
            _fileManager.write_file( APP_DIR ,
                'file_table.txt' ,
                JSON.stringify (_fileTable));
        }

        function qresolved ( what ) {
           var resolved = $q.defer();
           resolved.resolve(what);
           return resolved.promise;
        }

        return {
            // call on device ready
            init : function init ( app_dir ) {
                LOCAL_ROOT = window.cordova.file.externalDataDirectory || window.cordova.file.dataDirectory;
                _dirManager = new DirManager();
                _fileManager = new FileManager();
                APP_DIR = (app_dir || APP_DIR );

                _getTable();
                // for debugging!
                window.fileManager = _fileManager;
                window.dirManager = _dirManager;
            },
            // get url to use
            getURL : function (url) {
                if ( url && _fileTable[url] && _fileTable[url] === 'cached') {
                    return _fileTable[url].local;
                } else {
                    return url;
                }
            },
            /* cache if not already in file system
                @param URL
                @param directory
                */
// this all needs to be more clever re status etc. should create an object
            cacheURL  : function ( url, dir , name) {
                if ( url && _fileTable[url] && _fileTable[url].status === 'cached') {
                    return _fileTable[url].local;
                } else if ( url && dir && name && !_fileTable[url] ) {
                    _fileTable[url] = {
                        local : dir + '/' + name ,
                        status : 'queued'
                    };
                    _saveTable();
                }
                return url;
            },
            //download and wait, returns a promise that resolves to url to use
            //returns a promise

            downloadURL : function ( url, dir , name) {
                var deferred;
                if ( url && _fileTable[url] && _fileTable[url].status === 'cached') {
                    return qresolved(_fileTable[url].local );
                } else if ( url && dir && name && !_fileTable[url] ) {
                    _fileTable[url] = {
                        status : 'downloading'
                    };
                    deferred = $q.defer();
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
                            });
                        },
                        function ( error) {
                            _fileTable[url].status='failed';
                            _saveTable();
                            deferred.reject( error );
                        });
                    return deferred.promise;
                } else {
                    return qresolved(url);
                }
            },
            // clear cache by URL
            clear : {},
            // clear cache by directory (effectively an entire module )
            clearDir : {},
            // getStatus of a URL
            cacheStatus  : {}
        };

    } );
})(angular); // jshint ignore:line

