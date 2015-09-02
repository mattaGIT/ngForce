var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    lazy: false
});
var order = require('gulp-order');
var mainBowerFiles = require('main-bower-files');
var gulpFilter = require('gulp-filter');
var uglify = require('gulp-uglify');
var debug = require('gulp-debug');
var runSequence = require('run-sequence');

var srcBlob = './jsSrc/**/*.js';
var libBlob = './jsSrc/**/*.js';

gulp.task('cleanBuild', function() {

    return gulp.src('build', {
            read: false
        })
        .pipe(plugins.clean());
});

gulp.task('ngForce', function() {
    return gulp.src(srcBlob)
        .pipe(plugins.concat('ngForce1.js'))
        .pipe(gulp.dest('./build'));
});
gulp.task('ngForceWithDependencies', function() {
    return gulp.src(['./build/ngForce.js','./build/lib.js'])
        .pipe(plugins.concat('ngForce1WithDeps.js'))
        .pipe(gulp.dest('./build'));
});
gulp.task('ngForceWithDependenciesMinified', function() {
    return gulp.src(['./build/ngForce.js','./build/lib.js'])
        .pipe(uglify())
        .pipe(plugins.concat('ngForce1WithDeps.min.js'))
        .pipe(gulp.dest('./build'));
});

gulp.task('dependencies', function() {
    return gulp.src(mainBowerFiles())
        .pipe(gulpFilter(['**/*.js', '!*angular-hint*']))
        /*
         * If you need the scripts to be loaded in a different order,
         * edit the array below
         */
        .pipe(plugins.order([
            '**/jquery.js',
            '**/angular.js',
            '**/angular-*.js',
            '**/lo-dash.compat.js',
            '**/safeApply.js',
            '**/ngForce/**/*.js'
        ]))

    .pipe(plugins.concat('lib.js'))
        .pipe(gulp.dest('./build'));
});
//for making static resource

//for making minified src
gulp.task('combine', ['ngForceWithDependencies', 'ngForceWithDependenciesMinified']);
gulp.task('build', ['dependencies', 'ngForce']);
gulp.task('cleanAndBuild', ['cleanBuild']);
//define order
gulp.task('sequence', function(callback) {
  runSequence('cleanAndBuild',
              'build',
              'combine',
              callback);
});//default build
gulp.task('default', ['sequence']);
