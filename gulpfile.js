const gulp = require('gulp');
const diff = require('gulp-diff');
const plumber = require('gulp-plumber');

const copyFiles = () =>
  gulp.src('./brightID-expo/src/**/*.js').pipe(gulp.dest('./brightID-rn/src'));

const diffFiles = () =>
  gulp
    .src('./brightID-expo/src/**/*.js')
    .pipe(plumber())
    .pipe(diff('./brightID-rn/src'))
    .pipe(diff.reporter({ fail: true }));

gulp.task('diff', diffFiles);

gulp.task('sync', copyFiles);
