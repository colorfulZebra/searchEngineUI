'use strict';
/**
 * Packages:
 */
const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const rimraf = require('rimraf');
const runSequence = require('run-sequence');
const lazy = require('lazypipe');
const eslint = require('gulp-eslint');
const nodemon = require('gulp-nodemon');
const wiredep = require('wiredep').stream;
const watch = require('gulp-watch');
const livereload = require('gulp-livereload');
const plumber = require('gulp-plumber');

/**
 * Paths:
 * dev: development root path
 * release: release root path
 */
const version = {
  'dev': require('./bower.json').appPath || 'app',
  'release': 'dist' 
};

const path = {
  'scripts': version.dev + '/components/**/*.js',
  'mainscript': version.dev + '/app.js',
  'buildScriptsDest': version.release + '/components',
  'buildScripts': version.release + '/components/**/*.js',
  'serverScripts': 'server_dev/**/*.js',
  'serverLibs': 'server_dev/lib/**/*',
  'serverLibsDest': 'server/lib',
  'serverScriptsDest': 'server',
  'styles': version.dev + '/sass/*.scss',
  'mainstyle': version.dev + '/sass/main.scss',
  'stylesDest': version.release + '/styles',
  'views': {
    'main': version.dev + '/index.html',
    'notfound': version.dev + '/404.html',
    'files': version.dev + '/components/**/*.html'
  },
  'viewsDest': version.release + '/components',
  'images': version.dev + '/images/**/*',
  'imagesDest': version.release + '/images',
  'favicon': version.dev + '/favicon.ico',
  'bower': 'bower_components',
  'uikit': 'uikit',
  'fontawesome': 'fontawesome'
};

/**
 * Lazy pipe:
 * eslintScripts: check js code with eslint
 * babelScripts: translate js code with babel
 */
let babelScripts = lazy().pipe(babel, {presets: ['env']});
let eslintScripts = lazy().pipe(eslint, '.eslintrc.js').pipe(eslint.format).pipe(eslint.failAfterError);
let styleSass = lazy().pipe(sass, {outputStyle: 'compressed'}).pipe(autoprefixer, {browsers: ['last 1 version']});

/**
 * Tasks:
 * clean: clean dest server folder & dest app folder
 * styles: compile & compress sass file to css file
 */
/// clean
gulp.task('clean:server', function(cb) {
  rimraf('./' + path.serverScriptsDest, cb);
});

gulp.task('clean:dist', function(cb) {
  rimraf(`./${version.release}/!(${path.bower}|${path.uikit}|${path.fontawesome})`, cb);
});

gulp.task('clean', function(cb) {
  runSequence(['clean:server', 'clean:dist'], cb);
});

/// client build
gulp.task('client:scripts', function() {
  return gulp
    .src(path.scripts)
    .pipe(eslintScripts())
    .pipe(babelScripts())
    .pipe(gulp.dest(path.buildScriptsDest));
});

gulp.task('client:mainscript', function() {
  return gulp
    .src(path.mainscript)
    .pipe(eslintScripts())
    .pipe(babelScripts())
    .pipe(gulp.dest(version.release));
});

gulp.task('client:html', function() {
  return gulp
    .src(path.views.files)
    .pipe(gulp.dest(path.viewsDest));
});

gulp.task('client:mainpage', function() {
  return gulp
    .src(path.views.main)
    .pipe(wiredep({
      directory: `${version.release}/${path.bower}`,
      ignorePath: '../' + version.release + '/'
    }))
    .pipe(gulp.dest(version.release));
});

gulp.task('client:styles', function() {
  return gulp
    .src(path.mainstyle)
    .pipe(styleSass())
    .pipe(gulp.dest(path.stylesDest));
});

gulp.task('client:images', function() {
  return gulp
    .src(path.images)
    .pipe(gulp.dest(path.imagesDest));
});

gulp.task('client:favicon', function() {
  return gulp
    .src(path.favicon)
    .pipe(gulp.dest(version.release));
});

gulp.task('client:pageNotFound', function() {
  return gulp
    .src(path.views.notfound)
    .pipe(gulp.dest(version.release));
});

gulp.task('client', function(cb) {
  runSequence([
    'client:mainscript', 
    'client:scripts', 
    'client:html', 
    'client:styles', 
    'client:images', 
    'client:pageNotFound', 
    'client:favicon', 
    'client:mainpage',
  ], 
  cb);
});

/// server build
gulp.task('server:scripts', function() {
  return gulp
    .src(path.serverScripts)
    .pipe(eslintScripts())
    .pipe(babelScripts())
    .pipe(gulp.dest(path.serverScriptsDest));
});

gulp.task('server:libs', function() {
  return gulp
    .src(path.serverLibs)
    .pipe(gulp.dest(path.serverLibsDest));
});

gulp.task('serve', ['server:scripts', 'server:libs'], function() {
  return nodemon({
    script: 'server/app.js',
    ignore: ['app', 'dist', 'log', 'server_dev', 'node_modules', 'bower_components', 'schema.config.json', 'bower.json', 'package.json', 'gulpfile.babel.js']
  })
    .on('restart', function() {
      console.log('Application server restarted!');
    })
    .on('crash', function() {
      console.error('Application server crashed!');
    });
});

/// watch
gulp.task('watch', function() {
  livereload.listen();
  // monitor sass file
  watch(path.styles, function() {
    return gulp
      .src(path.mainstyle)
      .pipe(plumber())
      .pipe(styleSass())
      .pipe(gulp.dest(path.stylesDest))
      .pipe(livereload());
  });
  // monitor scripts
  watch(path.scripts)
    .pipe(plumber())
    .pipe(eslintScripts())
    .pipe(babelScripts())
    .pipe(gulp.dest(path.buildScriptsDest))
    .pipe(livereload());
  // monitor main script
  watch(path.mainscript)
    .pipe(plumber())
    .pipe(eslintScripts())
    .pipe(babelScripts())
    .pipe(gulp.dest(version.release))
    .pipe(livereload());
  // monitor html
  watch(path.views.files)
    .pipe(plumber())
    .pipe(gulp.dest(path.viewsDest))
    .pipe(livereload());
  // monitor main page
  watch(path.views.main)
    .pipe(plumber())
    .pipe(wiredep({
      directory: `${version.release}/${path.bower}`,
      ignorePath: '../' + version.release + '/'
    }))
    .pipe(gulp.dest(version.release))
    .pipe(livereload());
  // bower.json changed
  watch('bower.json', function() {
    return gulp.src(path.views.main)
      .pipe(plumber())
      .pipe(wiredep({
        directory: `${version.release}/${path.bower}`,
        ignorePath: '../' + version.release + '/'
      }))
      .pipe(gulp.dest(version.release))
      .pipe(livereload());
  });
  // monitor server files
  watch(path.serverScripts)
    .pipe(plumber())
    .pipe(eslintScripts())
    .pipe(babelScripts())
    .pipe(gulp.dest(path.serverScriptsDest))
    .pipe(livereload());
});

/// build all
gulp.task('build', ['clean'], function(cb) {
  runSequence(['client'], ['serve'], ['watch'], cb);
});

// Main task
gulp.task('default', ['build']);