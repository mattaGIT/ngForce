var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    lazy: false
});
var gutil = require('gulp-util');
var order = require('gulp-order');
var mainBowerFiles = require('main-bower-files');
var filter = require('gulp-filter');
var uglify = require('gulp-uglify');
var debug = require('gulp-debug');
var less = require('gulp-less');
var runSequence = require('run-sequence');


gulp.task('cleanBuild', function() {

    return gulp.src('build', {
            read: false
        })
        .pipe(plugins.clean());
});

gulp.task('ngForce', function() {
    return gulp.src('./jsSrc/**/*.js')
        .pipe(plugins.order([
            '**/ngForce.js',
            '**/subModules/*'
        ]))
        .pipe(plugins.concat('ngForce1.js'))
        .pipe(gulp.dest('./build/js'));
});
gulp.task('ngForceWithDependencies', function() {
    return gulp.src(['./build/js/lib.js', './build/js/ngForce1.js'])
        .pipe(plugins.concat('ngForce1WithDeps.js'))
        .pipe(gulp.dest('./build/js'));
});
gulp.task('ngForceWithDependenciesMinified', function() {
    return gulp.src(['./build/js/lib.js', './build/js/ngForce1.js'])
        .pipe(uglify({
            'mangle': false
        }))
        .pipe(plugins.concat('ngForce1WithDeps.min.js'))
        .pipe(gulp.dest('./build'));
});

gulp.task('js', function() {
    return gulp.src(mainBowerFiles())
        .pipe(filter(['**/*.js', '!*angular-hint*']))
        /*
         * If you need the scripts to be loaded in a different order,
         * edit the array below
         */
        .pipe(uglify(
            { 'mangle': false}
            ))
        .pipe(plugins.order([
            '**/jquery.js',
            '**/angular.js',
            '**/angular-*.js',
            '**/lo-dash.compat.js',
            '**/*.safeApply.js',
        ]))

    .pipe(plugins.concat('lib.js'))
        .pipe(gulp.dest('./build/js'));
});
gulp.task('css', function() {
    //concatenate vendor CSS files
    return gulp.src(mainBowerFiles())
        .pipe(filter('**/*.css'))
        .pipe(gulp.dest('./build/css'));
});
gulp.task('less', function() {
    //concatenate vendor CSS files
    return gulp.src(mainBowerFiles(), {
            base: 'bower_components'
        })
        .pipe(filter('**/*.less'))
        .pipe(less())
        .pipe(gulp.dest('./build/css'));
});
gulp.task('fonts', function() {
    //concatenate vendor CSS files
    return gulp.src(['bower_components/bootstrap/dist/fonts/*'])
        .pipe(debug())
        .pipe(gulp.dest('./build/fonts'));
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



gulp.task('save', ['meta-staticresource', 'zip-staticresource']);
//for making minified src
gulp.task('bootstrap',['css','fonts']);
gulp.task('combine', ['ngForceWithDependencies']);
gulp.task('build', ['js', 'ngForce']);
gulp.task('cleanAndBuild', ['cleanBuild']);
//define order
gulp.task('sequence', function(callback) {
    runSequence('cleanAndBuild',
        'build',
        'combine',
        callback);
}); //default build
gulp.task('default', ['sequence']);
