module.exports = function (grunt) {
    "use strict";

    grunt.initConfig( {
        pkg : grunt.file.readJSON( 'package.json' ),
        banner : '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>; */\n',
        // Task configuration.
        bower : {
            install : {
            }
        },
        karma : {
            options : {
                configFile : 'karma.conf.js'//,
//                runnerPort: 9100,
//                browsers:   ['Chrome']
            },
            e2e : {
//                reporters: 'dots'
            },
            dev : {
//                reporters: 'dots'
                configFile : 'karma.macdev.conf.js'
            }
        },
        // note clean with / on the end as without the * removes the directory, which I see as a bug
        clean:       ['test/artifacts/*', 'client/scripts/vendor'],
        copy : {
            main : {
                files : [
                    {expand : true, flatten : true, cwd : 'bower_components/prefixfree/', src : '*.min.js*', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/angular/', src : '*.min.js*', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/angular-animate/', src : '*.min.js*', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/angular-touch/', src : '*.min.js*', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/angular-ui-router/release/', src : '*.min.js*', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/angular-cordova-wrapper/release/', src : '*.min.js*', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/onsenui/build/js/', src : 'onsenui.js', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/angular-resource/', src : '*.min.js*', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/angular-cached-resource/', src : '*.min.js*', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/angular-cookies/', src : '*.min.js*', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/angular-sanitize/', src : '*.min.js*', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/underscore/', src : 'underscore.js', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/angular-media-player/dist', src : '*.min.js', dest : 'client/scripts/vendor/' },
                    //css
                    {expand : true, flatten : true, cwd : 'bower_components/modernizr/', src : 'modernizr.js', dest : 'client/scripts/vendor' },
                    {expand : true, cwd : 'bower_components/onsenui/build/css/', src : '**/*', dest : 'client/styles/' },
                    {expand : true, flatten : true, cwd : 'bower_components/animate.css/', src : 'animate.min.css', dest : 'client/styles/' }
                ]
            }
        },
        jshint : {
            options : {
                jshintrc : './.jshintrc',
                force : true
            },
            gruntfile : {
                src : 'Gruntfile.js'
            },
            all : {
                options : {
                    ignores : [
                        'client/scripts/vendor/**/*.js'
                    ]
                },
                src : [
                    'client/**/*.js'
                ]
            }
        },
        connect : {
            e2e : {
                options : {
                    port : 9000,
                    base : 'client',
                    hostname : '*'
//                    middleware: function (connect) {
//                        return [
//                            connect.static(__dirname + '/client/')
//                        ];
//                    }
                }
            },
            dev : {
                options : {
                    port : 9000,
                    base : 'client',
                    hostname : '*',
                    keepalive : true
                }
            }
        },
        protractor : {
            options : {
                noColor : false,
                configFile : 'protractor.conf.js'
            },
            dev : {
                options : {
                    args : {
//                        chromeOnly: true
                    }
                }
            }
        },
        phonegap: {
            config: {
                root: 'client',
                config: 'client/config.xml',
                cordova: '.cordova',
                html : 'index.html', // (Optional) You may change this to any other.html
                path: 'phonegap',
                cleanBeforeBuild: true, // when false the build path doesn't get regenerated
//                plugins: ['/local/path/to/plugin', 'http://example.com/path/to/plugin.git'],
                platforms: ['android' , 'ios'],
                maxBuffer: 200, // You may need to raise this for iOS.
                verbose: false,
                releases: 'releases',
                releaseName: function(){
                    var pkg = grunt.file.readJSON('package.json');
                    return(pkg.name + '-' + pkg.version);
                },
                debuggable: false,

                // Must be set for ios to work.
                // Should return the app name.
                name: function(){
                    var pkg = grunt.file.readJSON('package.json');
                    return pkg.name;
                }/*,

                // Add a key if you plan to use the `release:android` task
                // See http://developer.android.com/tools/publishing/app-signing.html
                key: {
                    store: 'release.keystore',
                    alias: 'release',
                    aliasPassword: function(){
                        // Prompt, read an environment variable, or just embed as a string literal
                        return('');
                    },
                    storePassword: function(){
                        // Prompt, read an environment variable, or just embed as a string literal
                        return('');
                    }
                },

                // Set an app icon at various sizes (optional)
                icons: {
                    android: {
                        ldpi: 'icon-36-ldpi.png',
                        mdpi: 'icon-48-mdpi.png',
                        hdpi: 'icon-72-hdpi.png',
                        xhdpi: 'icon-96-xhdpi.png'
                    },
                    wp8: {
                        app: 'icon-62-tile.png',
                        tile: 'icon-173-tile.png'
                    },
                    ios: {
                        icon29: 'icon29.png',
                        icon29x2: 'icon29x2.png',
                        icon40: 'icon40.png',
                        icon40x2: 'icon40x2.png',
                        icon57: 'icon57.png',
                        icon57x2: 'icon57x2.png',
                        icon60x2: 'icon60x2.png',
                        icon72: 'icon72.png',
                        icon72x2: 'icon72x2.png',
                        icon76: 'icon76.png',
                        icon76x2: 'icon76x2.png'
                    }
                },

                // Set a splash screen at various sizes (optional)
                // Only works for Android and IOS
                screens: {
                    android: {
                        ldpi: 'screen-ldpi-portrait.png',
                        // landscape version
                        ldpiLand: 'screen-ldpi-landscape.png',
                        mdpi: 'screen-mdpi-portrait.png',
                        // landscape version
                        mdpiLand: 'screen-mdpi-landscape.png',
                        hdpi: 'screen-hdpi-portrait.png',
                        // landscape version
                        hdpiLand: 'screen-hdpi-landscape.png',
                        xhdpi: 'screen-xhdpi-portrait.png',
                        // landscape version
                        xhdpiLand: 'www/screen-xhdpi-landscape.png'
                    },
                    ios: {
                        // ipad landscape
                        ipadLand: 'screen-ipad-landscape.png',
                        ipadLandx2: 'screen-ipad-landscape-2x.png',
                        // ipad portrait
                        ipadPortrait: 'screen-ipad-portrait.png',
                        ipadPortraitx2: 'screen-ipad-portrait-2x.png',
                        // iphone portrait
                        iphonePortrait: 'screen-iphone-portrait.png',
                        iphonePortraitx2: 'screen-iphone-portrait-2x.png',
                        iphone568hx2: 'screen-iphone-568h-2x.png'
                    }
                },

                // Android-only integer version to increase with each release.
                // See http://developer.android.com/tools/publishing/versioning.html
                versionCode: function(){ return(1) },

                // Android-only options that will override the defaults set by Phonegap in the
                // generated AndroidManifest.xml
                // See https://developer.android.com/guide/topics/manifest/uses-sdk-element.html
                minSdkVersion: function(){ return(10) },
                targetSdkVersion: function(){ return(19) },

                // iOS7-only options that will make the status bar white and transparent
                iosStatusBar: 'WhiteAndTransparent',

                // If you want to use the Phonegap Build service to build one or more
                // of the platforms specified above, include these options.
                // See https://build.phonegap.com/
                remote: {
                    username: 'your_username',
                    password: 'your_password',
                    platforms: ['android', 'blackberry', 'ios', 'symbian', 'webos', 'wp7']
                },

                // Set an explicit Android permissions list to override the automatic plugin defaults.
                // In most cases, you should omit this setting. See 'Android Permissions' in README.md for details.
                permissions: ['INTERNET', 'ACCESS_COURSE_LOCATION', '...']
                 */
            }
        }
   });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint' );
    grunt.loadNpmTasks('grunt-selenium-webdriver' );
    grunt.loadNpmTasks( 'grunt-contrib-clean' );
    // use grunt phonegap:build:android
    grunt.loadNpmTasks( 'grunt-phonegap' );

    grunt.registerTask('e2e', [
        'selenium_phantom_hub',
        'connect:e2e',
        'protractor',
        'selenium_stop'
    ]);

    // use this for testing via webstorm
    grunt.registerTask('webstorm', [
        'selenium_phantom_hub',
        'connect:dev'
    ]);

    // use this for testing via webstorm
    grunt.registerTask('procli', [
        'selenium_start',
        'connect:dev'
    ]);

    // test task
    grunt.registerTask( 'test', [ 'karma:e2e' , 'e2e' ] );

    // Default task.
    grunt.registerTask( 'build', ['clean', 'bower', 'copy' , 'jshint' ] );

    // Default task.
    grunt.registerTask( 'default', ['build' ] );

};