var gulp = require('gulp'),
  babel = require('gulp-babel'),
  nodemon = require("gulp-nodemon");

gulp.task('build', function () {
  return gulp.src("src/**/**.js")
    .pipe(babel({stage : 0}))
    .pipe(gulp.dest("dist"));
});

gulp.task('start', function () {
  nodemon({
    script: 'dist/app.js',
    tasks: ['build'],
    ignore: ['dist/*'],
    ext: 'js html',
    env: { 'NODE_ENV': 'development' }
  })
})

gulp.task('default', ['build', 'start']);