var gulp = require('gulp');
var clean = require('gulp-clean');
var minify = require('gulp-minify');
const jshint = require('gulp-jshint');
const mocha = require('gulp-mocha');
let jshintXMLReporter = require('gulp-jshint-xml-file-reporter');
var istanbul = require('gulp-istanbul');
const zip = require('gulp-zip');

gulp.task('myclean', function () {
    return gulp.src(['reports/','coverage'], {read: false})
        .pipe(clean());
});

gulp.task('compress', function() {
  gulp.src('app/*.js')
    .pipe(minify({
        ext:{
            src:'-original.js',
            min:'-minified.js'
        },
        exclude: ['tasks'],
        ignoreFiles: ['.combo.js', '-min.js']
    }))
    .pipe(gulp.dest('dist'))
});

gulp.task('lint', function() {
  return gulp.src('*.js')
    .pipe(jshint())
    //.pipe(jshint.reporter('default'));
	.pipe(jshint.reporter('gulp-jshint-html-reporter', {
      filename: 'reports' + '/jshint-report.html',
      createMissingFolders: true
    }))
});

gulp.task('lint-xml', function() {
  return gulp.src('*.js')
    .pipe(jshint())
    //.pipe(jshint.reporter('default'));
	.pipe(jshint.reporter(jshintXMLReporter))
    .on('end', jshintXMLReporter.writeFile({
      format: 'jslint',
      filePath: 'reports/jshint.xml'
    }));
});
 
gulp.task('utest', () =>
    gulp.src('test.js', {read: false})
        // `gulp-mocha` needs filepaths so you can't have any plugins before it 
        .pipe(mocha({reporter: 'nyan'}))
);

gulp.task('pre-test', function () {
  return gulp.src(['calc.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('codecoverage', ['pre-test'], function () {
  return gulp.src(['test.js'])
    .pipe(mocha())
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});

gulp.task('ziptask', () =>
    gulp.src('*.js')
        .pipe(zip('archive.zip'))
        .pipe(gulp.dest('dist'))
);

gulp.task('default', ['myclean', 'compress', 'lint', 'lint-xml','utest','codecoverage','ziptask'], function () { });