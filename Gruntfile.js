module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        pkg:         grunt.file.readJSON( 'package.json' ),
        banner:      '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>; */\n',
        // Task configuration.
        bower: {
            install: {
            }
        },
        karma:       {
            options: {
                configFile: 'karma.conf.js'//,
//                runnerPort: 9100,
//                browsers:   ['Chrome']
            },
            e2e:     {
//                reporters: 'dots'
            }
        },
        copy: {
            main: {
                files: [
                    {expand: true, flatten: true, cwd: 'bower_components/prefixfree/', src:'*.min.js*', dest: 'client/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular/', src:'*.min.js*', dest: 'client/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular-animate/', src:'*.min.js*', dest: 'client/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular-touch/', src:'*.min.js*', dest: 'client/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular-ui-router/release/', src:'*.min.js*', dest: 'client/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular-cordova-wrapper/release/', src:'*.min.js*', dest: 'client/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/onsenui/build/js/', src:'onsenui.js', dest: 'client/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular-resource/', src:'*.min.js*', dest: 'client/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular-cached-resource/', src:'*.min.js*', dest: 'client/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular-cookies/', src:'*.min.js*', dest: 'client/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular-sanitize/', src:'*.min.js*', dest: 'client/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/underscore/', src:'underscore.js', dest: 'client/scripts/vendor/' },
                    //css
                    {expand: true, flatten: true, cwd: 'bower_components/modernizr/', src:'modernizr.js', dest: 'client/scripts/vendor' },
                    {expand: true, cwd: 'bower_components/onsenui/build/css/', src:'**/*', dest: 'client/styles/' },
                    {expand: true, flatten: true, cwd: 'bower_components/animate.css/', src:'animate.min.css', dest: 'client/styles/' }
                ]
            }
        },
        jshint:      {
            options:   {
                jshintrc: './.jshintrc',
                force: true
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            all:       {
                options: {
                    ignores:[
                        'client/scripts/vendor/**/*.js'
                    ]
                },
                src: [
                    'client/**/*.js'
                ]
            }
        },
        connect: {
            e2e: {
                options: {
                    port: 9000,
                    base: 'client',
                    hostname: '*'
//                    middleware: function (connect) {
//                        return [
//                            connect.static(__dirname + '/client/')
//                        ];
//                    }
                }
            },
            dev: {
                options: {
                    port: 9000,
                    base: 'client',
                    hostname: '*',
                    keepalive: true
                }
            }
        },
        protractor: {
            options: {
                noColor: false,
                configFile: 'protractor.conf.js'
            },
            dev: {
                options: {
                    args: {
//                        chromeOnly: true
                    }
                }
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
    grunt.registerTask( 'test', [ 'karma' , 'e2e' ] );

    // Default task.
    grunt.registerTask( 'build', ['bower', 'copy' , 'jshint' ] );

    // Default task.
    grunt.registerTask( 'default', ['build' ] );

};