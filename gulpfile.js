var gulp = require('gulp'),
	babel = require("gulp-babel");

gulp.task("default", function () {
  return gulp.src("src/app.js")
    .pipe(babel({stage : 0}))
    .pipe(gulp.dest("dist"));
});