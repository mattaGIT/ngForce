var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    lazy: false
});
var gutil = require('gulp-util');
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
function createFileFromString(filename, string) {
    var src = require('stream').Readable({
        objectMode: true
    })
    src._read = function() {
        this.push(new gutil.File({
            cwd: "",
            base: "",
            path: filename,
            contents: new Buffer(string)
        }))
        this.push(null)
    }
    return src
}
gulp.task('zip-staticresource', function() {
    return gulp.src('build/**/*')

    .pipe(plugins.zip('ngForce1.resource'))
        .pipe(gulp.dest('./src/staticresources'));
});

gulp.task('meta-staticresource', function() {
    return createFileFromString('ngForce1.resource-meta.xml', '<?xml version="1.0" encoding="UTF-8"?><StaticResource xmlns="http://soap.sforce.com/2006/04/metadata"><cacheControl>Private</cacheControl><contentType>application/octet-stream</contentType></StaticResource>')
        .pipe(gulp.dest('./src/staticresources'));
});

gulp.task('meta-page', function() {
    return createFileFromString('ngForce1.page-meta.xml', '<?xml version="1.0" encoding="UTF-8"?><ApexPage xmlns="http://soap.sforce.com/2006/04/metadata"><apiVersion>33.0</apiVersion><availableInTouch>true</availableInTouch><label>ngForce1</label></ApexPage>')
        .pipe(gulp.dest('./src/pages'));
});

gulp.task('vf-page', function() {
    return gulp.src('./app/ngForce1.page')
        .pipe(gulp.dest('./src/pages'));
});
gulp.task('save-static-resource-zip', ['meta-staticresource', 'zip-staticresource']);
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
