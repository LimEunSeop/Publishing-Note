'use strict'

var gulp = require('gulp')
var sass = require('gulp-sass')
var rename = require('gulp-rename')
var sourcemaps = require('gulp-sourcemaps')

sass.compiler = require('node-sass')

const sassProjects = function () {
  return gulp
    .src('projects/*/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(
      rename(function (path) {
        path.dirname = path.dirname.replace(/(\/.*)$/, '/css')
        path.basename = 'style'
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('projects'))
}

const sassMain = function () {
  return gulp
    .src('styles/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(
      rename(function (path) {
        path.basename = 'style'
        console.log(path)
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('styles'))
}

gulp.task('sass:projects', sassProjects)

gulp.task('sass:main', sassMain)

gulp.task('sass:watch', function () {
  sassProjects()
  sassMain()
  gulp.watch('projects/*/scss/**/*.scss', gulp.series('sass:projects'))
  gulp.watch('styles/*.scss', gulp.series('sass:main'))
})
