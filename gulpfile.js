var gulp = require('gulp'),
  babel = require('gulp-babel'),
  del = require('del'),
  nodemon = require("gulp-nodemon");

gulp.task('clean', function () {
  return del(['dist/**']);
});

gulp.task('build', function () {
  return gulp.src("src/**/**.js")
    .pipe(babel({stage : 0}))
    .pipe(gulp.dest("dist"));
});

gulp.task('start', ['build'], function () {
  nodemon({
    script: 'dist/app.js',
    tasks: ['build'],
    ignore: ['dist/*'],
    ext: 'js html',
    env: { 'NODE_ENV': 'development' }
  })
})

gulp.task('default', ['build', 'start']);