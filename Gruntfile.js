/*global module:false*/
module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-html2js');
  
  // Project configuration.
  grunt.initConfig({
    
    builddir: 'build',
    
    pkg: grunt.file.readJSON('package.json'),
    
    buildtag: '-dev-' + grunt.template.today('yyyy-mm-dd'),
    
    meta: {
      banner: '/**\n' +
        ' * <%= pkg.description %>\n' +
        ' * @version v<%= pkg.version %><%= buildtag %>\n' +
        ' */'
    },
    
    clean: [ '<%= builddir %>', 'tmp' ],
    
    concat: {
      options: {
        banner: '<%= meta.banner %>\n(function (window, angular, undefined) {\n',
        footer: '})(window, window.angular);'
      },
      build: {
        src: [
          'src/**/*.js',
          'tmp/**/*.js'
        ],
        dest: '<%= builddir %>/<%= pkg.name %>.js'
      }
    },
    
    html2js: {
      options: {
        module: 'templates-<%= pkg.name %>',
        rename: html2jsRename
      },
      main: {
        src: ['src/**/*.tpl.html'],
        dest: 'tmp/templates.js'
      }
    },

    uglify: {
      options: {
        banner: '<%= meta.banner %>\n'
      },
      build: {
        files: {
          '<%= builddir %>/<%= pkg.name %>.min.js': ['<banner:meta.banner>', '<%= concat.build.dest %>']
        }
      }
    },
    
    release: {
      files: ['<%= pkg.name %>.js', '<%= pkg.name %>.min.js'],
      src: '<%= builddir %>',
      dest: 'release'
    },
    
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js', 'tests/**/*.js', '<%= builddir %>/<%= pkg.name %>.js'],
      options: {
        eqnull: true
      }
    },
    
    delta: {
      files: ['Gruntfile.js', 'src/**/*.js', 'src/**/*.tpl.html', 'tests/**/*.js'],
      tasks: ['build', 'karma:debug:run']
    },
    
    connect: {
      server: {}
    },

    karma: {
      unit: {
        configFile: 'config/karma_unit.config.js',
        runnerPort: 9999,
        singleRun: true,
        browsers: ['PhantomJS']
      },
      
      e2e: {
        configFile: 'config/karma_e2e.config.js',
        runnerPort: 10999,
        singleRun: false,
        autoWatch: true,
        browsers: ['Chrome']
      },

      debug: {
        configFile: 'config/karma_unit.config.js',
        runnerPort: 9999,
        background: true,
        browsers: ['Chrome']
      }
    }
  });

  grunt.registerTask('default', ['clean', 'build', 'karma:unit']);
  grunt.registerTask('build', 'Perform a normal build', ['jshint', 'html2js', 'concat', 'uglify']);
  grunt.registerTask('dist', 'Perform a clean build and generate documentation', ['clean', 'build']);
  grunt.registerTask('release', 'Tag and perform a release', ['prepare-release', 'dist', 'perform-release']);

  grunt.renameTask( 'watch', 'delta' );
  grunt.registerTask('watch', 'Run dev server and watch for changes', ['build', 'connect', 'karma:debug', 'delta']);

  grunt.registerTask('prepare-release', function () {
    var bower = grunt.file.readJSON('bower.json'),
        version = bower.version;
    if (version != grunt.config('pkg.version')) throw 'Version mismatch in bower.json';

    promising(this,
      ensureCleanMaster().then(function () {
        return exec('git tag -l \'' + version + '\'');
      }).then(function (result) {
        if (result.stdout.trim() !== '') throw 'Tag \'' + version + '\' already exists';
        grunt.config('buildtag', '');
        grunt.config('builddir', 'release');
      })
    );
  });

  grunt.registerTask('perform-release', function () {
    grunt.task.requires([ 'prepare-release', 'dist' ]);

    var version = grunt.config('pkg.version'), releasedir = grunt.config('builddir');
    promising(this,
      system('git add \'' + releasedir + '\'').then(function () {
        return system('git commit -m \'release ' + version + '\'');  
      }).then(function () {
        return system('git tag \'' + version + '\'');
      })
    );
  });


  // Helpers for custom tasks, mainly around promises / exec
  var exec = require('faithful-exec'), shjs = require('shelljs');

  function system(cmd) {
    grunt.log.write('% ' + cmd + '\n');
    return exec(cmd).then(function (result) {
      grunt.log.write(result.stderr + result.stdout);
    }, function (error) {
      grunt.log.write(error.stderr + '\n');
      throw 'Failed to run \'' + cmd + '\'';
    });
  }

  function promising(task, promise) {
    var done = task.async();
    promise.then(function () {
      done();
    }, function (error) {
      grunt.log.write(error + '\n');
      done(false);
    });
  }

  function ensureCleanMaster() {
    return exec('git symbolic-ref HEAD').then(function (result) {
      if (result.stdout.trim() !== 'refs/heads/master') throw 'Not on master branch, aborting';
      return exec('git status --porcelain');
    }).then(function (result) {
      if (result.stdout.trim() !== '') throw 'Working copy is dirty, aborting';
    });
  }

  /**
   * Rename function for HTML2JS module that takes care of making sure
   * that our packag name is prepended to all of our template filenames
   * when the templates are compiled.
   *
   * We do this to make sure that when we have multiple modules that have
   * templates of the same name the angular.module('') for each templated
   * doesn't all share this exact name.
   */
  function html2jsRename(moduleName) {
    return grunt.config('pkg.name') + '/' + moduleName;
  }
};
