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
                configFile: 'karma.conf.js',
                runnerPort: 9100,
                browsers:   ['Chrome']
            },
            dev:     {
                reporters: 'dots'
            }
        },
        copy: {
            main: {
                files: [
                    {expand: true, flatten: true, cwd: 'bower_components/prefixfree/', src:'*.min.js', dest: 'angular/scripts/vendor/' },                    {flatten: true, src: ['bower_components/angular/*.min.js'], dest: 'angular/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular/', src:'*.min.js', dest: 'angular/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular-animate/', src:'*.min.js', dest: 'angular/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular-touch/', src:'*.min.js', dest: 'angular/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular-ui-router/release/', src:'*.min.js', dest: 'angular/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular-cordova-wrapper/release/', src:'*.min.js', dest: 'angular/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/onsenui/build/js/', src:'onsenui.js', dest: 'angular/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/onsenui/build/js/', src:'onsenui.js', dest: 'angular/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular-resource/', src:'*.min.js', dest: 'angular/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular-cached-resource/', src:'*.min.js', dest: 'angular/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular-cookies/', src:'*.min.js', dest: 'angular/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/angular-sanitize/', src:'*.min.js', dest: 'angular/scripts/vendor/' },
                    {expand: true, flatten: true, cwd: 'bower_components/modernizr/', src:'*.js', dest: 'angular/scripts/vendor' },
                    {expand: true, cwd: 'bower_components/onsenui/build/css/', src:'**/*', dest: 'angular/styles/' },
                    {expand: true, flatten: true, cwd: 'bower_components/animate.css/', src:'animate.min.css', dest: 'angular/styles/' }
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
                        'angular/vendor/*.js'
                    ]
                },
                src: [
                    'angular/**/*.js'
                ]
            }
        }

    });

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint' );

    // Default task.
    grunt.registerTask( 'default', ['bower', 'copy' , 'jshint' , 'karma' ] );
};