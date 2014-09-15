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
                    {expand : true, flatten : true, cwd : 'bower_components/angular-cached-resource/', src : '*.js*', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/angular-cookies/', src : '*.min.js*', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/angular-sanitize/', src : '*.min.js*', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/underscore/', src : 'underscore.js', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/angular-media-player/dist', src : '*.min.js', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/ngAnimate-animate.css/', src : 'animate.js', dest : 'client/scripts/vendor/' },
                    {expand : true, flatten : true, cwd : 'bower_components/abdmob/x2js', src : '*.min.js', dest : 'client/scripts/vendor/' },
                    //css
                    {expand : true, flatten : true, cwd : 'bower_components/modernizr/', src : 'modernizr.js', dest : 'client/scripts/vendor' },
                    {expand : true, cwd : 'bower_components/onsenui/build/css/', src : '**/*', dest : 'client/styles/' },
                    // copies over fa provided by onsen but we use full icons anyway
                    {expand : true, cwd : 'bower_components/font-awesome/css/', src : '**/*', dest : 'client/styles/' },
                    {expand : true, cwd : 'bower_components/font-awesome/fonts/', src : '**/*', dest : 'client/fonts/' },
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
                noColor : false
            },
            dev : {   // Grunt requires at least one target to run so you can simply put 'all: {}' here too.
                options: {
                    configFile: "protractor.conf.dev.js", // Target-specific config file
                    args: {} // Target-specific arguments
                }
            },
            ci: {
                options : {
                    configFile : "protractor.conf.js", // Target-specific config file
                    args : {} // Target-specific arguments
                }
            }
        },
        selenium_start : {
            options : { timeout : 9999} // otherwise procli keeps shutting, most annoying someone screwed with this
        },
        phonegap: {
            config: {
                root: 'client',
                config: 'client/config.xml',
                cordova: '.cordova',
                html : 'index.html', // (Optional) You may change this to any other.html
                path: 'phonegap',
                cleanBeforeBuild: false, // when false the build path doesn't get regenerated
//                plugins: ['/local/path/to/plugin', 'http://example.com/path/to/plugin.git'],
                plugins: ['org.apache.cordova.device' ,
                           'org.apache.cordova.statusbar' ,
                           'org.apache.cordova.network-information',
                           'org.apache.cordova.media',
                            'org.apache.cordova.file',
                            'org.apache.cordova.file-transfer',
                            'org.apache.cordova.splashscreen',
                            'http://github.com/phonegap-build/GAPlugin.git'
                ],
                platforms: ['android' , 'ios'],
                maxBuffer: 200, // You may need to raise this for iOS.
                verbose: false,
                releases: 'releases',
                releaseName: function(){
                    var pkg = grunt.file.readJSON('package.json');
                    return(pkg.name + '-' + pkg.version);
                },
                debuggable: true,
                // Set an app icon at various sizes (optional)

                icons: {
                    android: {
                        ldpi: 'client/icons/droid/ic_launcher.png',
                        mdpi: 'client/icons/droid/ic_launcher2.png',
                        hdpi: 'client/icons/droid/ic_launcher3.png',
                        xhdpi: 'client/icons/droid/ic_launcher4.png'
                    }
//                    wp8: {
//                        app: 'icon-62-tile.png',
//                        tile: 'icon-173-tile.png'
//                    },
                    /* ios icons not working, think they are copying to wrong directory - have a look for resources
                    ios: {
                        icon29: 'client/icons/ios/icon-Small.png',
                        icon29x2: 'client/icons/ios/icon-Small.png',
                        icon40: 'client/icons/ios/icon-40.png',
                        icon40x2: 'client/icons/ios/icon-40@2x.png',
                        icon57: 'client/icons/ios/icon-57.png',
                        icon57x2: 'client/icons/ios/icon-57@2x.png',
                        icon60: 'client/icons/ios/icon-60.png',
                        icon60x2: 'client/icons/ios/icon-60@2x.png',
                        icon72: 'client/icons/ios/icon-72.png',
                        icon72x2: 'client/icons/ios/icon-72@2x.png',
                        icon76: 'client/icons/ios/icon-76.png',
                        icon76x2: 'client/icons/ios/icon-76@2x.png'
                    }
                     */
                },
                // Set a splash screen at various sizes (optional)
                // Only works for Android and IOS
                screens: {
                    android: {
                        ldpi: 'client/screen/default.png',
                        // landscape version
                        ldpiLand: 'client/screen/default.png',
                        mdpi: 'client/screen/default.png',
                        // landscape version
                        mdpiLand: 'client/screen/default.png',
                        hdpi: 'client/screen/default.png',
                        // landscape version
                        hdpiLand: 'client/screen/default.png',
                        xhdpi: 'client/screen/default.png',
                        // landscape version
                        xhdpiLand: 'client/screen/default.png'
                    }
// again ios not working for local build, need to copy the right filename to the right directory                    ios: 'client/screen/default.png'
    /*{
                        // ipad landscape
                        ipadLand: 'client/screen/default.png',
                        ipadLandx2: 'client/screen/default.png',
                        // ipad portrait
                        ipadPortrait: 'client/screen/default.png',
                        ipadPortraitx2: 'client/screen/default.png',
                        // iphone portrait
                        iphonePortrait: 'client/screen/default.png',
                        iphonePortraitx2: 'client/screen/default.png',
                        iphone568hx2: 'client/screen/default.png'
                    }*/
                },
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
        'protractor:ci',
        'selenium_stop'
    ]);
    grunt.registerTask('e2e:dev', [
        'selenium_start',
        'connect:e2e',
        'protractor:dev',
        'selenium_stop'
    ]);
/*
    grunt.registerTask('e2e', [
        'selenium_phantom_hub',
        'connect:e2e',
        'protractor:dev',
        'selenium_stop'
    ]);
*/

    // use this for testing via webstorm
    grunt.registerTask('webstorm', [
        'selenium_phantom_hub',
        'connect:dev'
    ]);

    // use this for testing via protractor client
    // https://github.com/angular/protractor/blob/master/docs/debugging.md
    // ./node_modules/protractor/bin/elementexplorer.js localhost:9000
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