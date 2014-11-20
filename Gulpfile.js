var gulp = require('gulp'),
    webserver = require('gulp-webserver'),
    sass = require('gulp-sass'),
    neat = require('node-neat'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha');
    

var paths = {
  scss: './scss/*.scss',
  test: './spec/*.js',
  js: './js/*.js'
};

function log(error){
  console.log(error.message);
}

gulp.task('sass', function(){
  gulp.src(paths.scss)
    .pipe(sass({
      includePaths: neat.with(paths.scss)
    }))
    .on('error', log)
    .pipe(concat('style.css'))
    .pipe(gulp.dest('.'));
});

gulp.task('jshint', function(){
  gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('mocha', function(){
  gulp.src(paths.test, {read: false})
    .pipe(mocha({
      reporter: 'nyan',
      globals: {
        should: require('chai').should()
      }
    }))
    .on('error', function(){});
});

gulp.task('default',['sass', 'mocha', 'jshint'], function(){
  console.log("Gulp runnin'");
  gulp.watch(paths.scss, ['sass']);
  gulp.watch([paths.test, paths.js], ['mocha']);
  gulp.watch(paths.js, ['jshint']);
  gulp.src('./').pipe(webserver({
    livereload: true,
    port: 8000,
    open: true
  }));
});
