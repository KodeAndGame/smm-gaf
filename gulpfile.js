var gulp = require('gulp'),
  babel = require('gulp-babel'),
  nodemon = require('gulp-nodemon'),
  env = require('gulp-env'),
  shell = require('gulp-shell'),
  del = require('del')

gulp.task('clean', function () {
  return del(['dist/**']);
});

gulp.task('set-env', function() {
  env({
    vars: {
      DEBUG: 'smm-gaf-*'
    }
  })
});

gulp.task('build', function () {
  return gulp.src("src/**/**.js")
    .pipe(babel({stage : 0}))
    .pipe(gulp.dest("dist"));
});

gulp.task('start', ['set-env', 'build'], function () {
  nodemon({
    script: 'dist/app.js',
    tasks: ['build'],
    ignore: ['dist/*'],
    ext: 'js html',
    env: { 'NODE_ENV': 'development' }
  })
})

gulp.task('dbg', ['set-env', 'build'], shell.task([
  'node debug dist/app.js'
]));


gulp.task('default', ['start']);