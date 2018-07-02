const gulp = require('gulp');
const diff = require('gulp-diff');

const compare = () => gulp.src('./brightID-expo/src/**/*.js').pipe(diff('./brightID-rn/src')).pipe(diff.reporter({ fail: true }));
gulp.task('default', compare);