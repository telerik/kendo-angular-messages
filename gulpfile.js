'use strict';

const gulp = require('gulp');
const yaml = require('gulp-yaml-validate');

gulp.task('default', ['lint']);

gulp.task('lint', () => gulp
    .src('./messages/**/*.yml')
    .pipe(yaml())
);

