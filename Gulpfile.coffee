gulp = require 'gulp'
neat = require 'node-neat'
$ = do require 'gulp-load-plugins'
paths =
  scss: './scss/*.scss'
  test: './spec/*.js'
#SASS
gulp.task 'sass', (cb) ->
  gulp.src paths.scss
    .pipe do $.plumber
    .pipe $.sass
      includePaths: neat.with paths.scss
    .pipe $.concat 'style.css'
    .pipe gulp.dest './'
#SERVER
gulp.task 'server',['sass'], (cb) ->
  gulp.src './'
    .pipe $.webserver
      livereload: true
      port: 8000
      open: ['/','/spec']
  gulp.watch paths.scss, ['sass']
#DEFAULT
gulp.task 'default', ['server'], ->
  console.log "gulp runnin'"
