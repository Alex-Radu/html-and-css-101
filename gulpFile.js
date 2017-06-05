const gulp = require('gulp');
const mustache = require('gulp-mustache');
const rename = require('gulp-rename');
const pretify = require('gulp-prettify');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const dir = require('node-dir');

function compileTemplate(err, fileContent, fileName, next) {
  gulp.src('./template.mustache')
    .pipe(mustache({
      lessonNo: fileName.match(/(lesson-\d)/)[0]
    }, {}, {
      partial: fileContent
    }))
    .pipe(rename(fileName.replace('.mustache', '') + '.html'))
    .pipe(pretify())
    .pipe(gulp.dest('./dest'));

    next();
}

gulp.task('templates', function() {
  return dir.readFiles('./pages', {
    match: /.mustache$/
  }, compileTemplate);
});

gulp.task('css', function() {
  return gulp.src('./styles/styles.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dest/styles/'))
});

gulp.task('images', function() {
    return gulp.src('./images/*.png')
      .pipe(gulp.dest('./dest/images'));
})

gulp.task('default', ['templates', 'css', 'images'], function() {

    browserSync.init({
        server: {
          baseDir: './dest',
          index: 'pages/lesson-1-general-html-structure.html'
        }
    });

    gulp.watch(['styles/*.scss', 'pages/*.mustache'], ['templates', 'css', 'images']).on('change', browserSync.reload);
});
