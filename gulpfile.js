'use strict';

const gulp = require('gulp');
const yaml = require('gulp-yaml-validate');

gulp.task('lint', () => gulp
    .src('./messages/**/*.yml')
    .pipe(yaml())
);

gulp.task('default', gulp.series('lint'));

