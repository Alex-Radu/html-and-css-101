const gulp = require('gulp');
const mustache = require('gulp-mustache');
const rename = require('gulp-rename');
const pretify = require('gulp-prettify');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const dir = require('node-dir');

let templateData = [];

function structureTemplateData(err, fileContent, fileName, next) {
  fileName = fileName.replace('pages/', '').replace('.mustache', '');

  let lessonNoRaw = fileName.match(/lesson(-\d+)+/)[0].replace(/-/g, ' ');
  let lessonNameRaw = fileName.substring(lessonNoRaw.length + 1).replace(/-/g, ' ');
  let lessonNo = lessonNoRaw.charAt(0).toUpperCase() + lessonNoRaw.slice(1);
  let lessonName = lessonNameRaw.charAt(0).toUpperCase() + lessonNameRaw.slice(1);

  templateData.push({
    pageTitle: lessonNo + ': ' + lessonName,
    pageContent: fileContent
  });

  next();
}

function compileTemplates(err, files) {
  templateData.forEach(function(page, pageIndex) {
    let lessonArray = files.map(function(file, fileIndex) {
      return {
        link: file.replace('mustache', 'html'),
        title: templateData[fileIndex].pageTitle,
        selected: fileIndex === pageIndex
      }
    });

    page.navDetails = lessonArray;

    gulp.src('./template.mustache')
      .pipe(mustache(page))
      .pipe(rename(lessonArray[pageIndex].link))
      .pipe(pretify())
      .pipe(gulp.dest('./dest'));
  });
}

gulp.task('templates', function() {
  templateData = [];
  return dir.readFiles('./pages', {
    match: /.mustache$/
  }, structureTemplateData, compileTemplates);
});

gulp.task('css', function() {
  gulp.src('./styles/*.css')
    .pipe(gulp.dest('./dest/styles'));

  return gulp.src('./styles/styles.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dest/styles/'))
});

gulp.task('images', function() {
  return gulp.src('./images/*.png')
    .pipe(gulp.dest('./dest/images'));
})

gulp.task('js', function() {
  return gulp.src('./js/*.js')
    .pipe(gulp.dest('./dest/js'));
})

gulp.task('default', ['templates', 'css', 'js', 'images'], function() {

  browserSync.init({
    server: {
      baseDir: './dest',
      index: 'pages/lesson-1-general-html-structure.html'
    }
  });

  gulp.watch(['styles/*.scss', 'pages/*.mustache', './*.mustache'], ['templates', 'css', 'js', 'images']).on('change', browserSync.reload);
});
