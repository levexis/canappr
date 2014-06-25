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
                    {expand: true, src: ['bower_components/prefix-free/*.min.js'], dest: 'www/scripts/vendor' },
                    {expand: true, src: ['bower_components/angular/*.min.js'], dest: 'www/scripts/vendor' },
                    {expand: true, src: ['bower_components/angular-animate/*.min.js'], dest: 'www/scripts/vendor' },
                    {expand: true, src: ['bower_components/angular-touch/*.min.js'], dest: 'www/scripts/vendor' },
                    {expand: true, src: ['bower_components/ngular-cordova-wrapper/release/*.min.js'], dest: 'www/scripts/vendor' },
                    {expand: true, src: ['bower_components/onsenui/build/js/onsenui.js'], dest: 'www/scripts/vendor' },
                    {expand: true, src: ['bower_components/angular-resource/*.min.js'], dest: 'www/scripts/vendor' },
                    {expand: true, src: ['bower_components/angular-cached-resource/*.min.js'], dest: 'www/scripts/vendor' },
                    {expand: true, src: ['bower_components/angular-cookies/*.min.js'], dest: 'www/scripts/vendor' },
                    {expand: true, src: ['bower_components/angular-sanatize/*.min.js'], dest: 'www/scripts/vendor' },
                    {expand: true, src: ['bower_components/onsenui/build/css/topcoat-mobile-onsen-ios7.css'], dest: 'www/styles' },
                    {expand: true, src: ['bower_components/onsenui/build/css/onsenui.css'], dest: 'www/styles' },
                    {expand: true, src: ['bower_components/animate.css/animate.min.css'], dest: 'www/styles' }
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
                        'www/vendor/*.js'
                    ]
                },
                src: [
                    'www/**/*.js'
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