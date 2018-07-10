const gulp = require('gulp');
const diff = require('gulp-diff');
const plumber = require('gulp-plumber');

const compare = () =>
  gulp
    .src('./brightID-expo/src/**/*.js')
    .pipe(plumber())
    .pipe(diff('./brightID-rn/src'))
    .pipe(diff.reporter({ fail: true }));

const copyFiles = () =>
  gulp.src('./brightID-expo/src/**/*').pipe(gulp.dest('./brightID-rn/src'));

gulp.task('diff', compare);

gulp.task('sync', copyFiles);
