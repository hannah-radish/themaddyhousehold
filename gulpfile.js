const gulp = require('gulp')
const path = require('path')
const gutil = require('gulp-util');
const fs = require('fs')
const sass = require('gulp-sass');
const insert = require('gulp-insert');
const serve = require('gulp-serve');
const merge = require('merge-stream');
var child_process = require('child_process')

function exec(cmd, fn) {
  gutil.log('Run:', gutil.colors.cyan(cmd));
  return child_process.exec(cmd, fn)
}

function execSync(cmd) {
  gutil.log('Run:', gutil.colors.cyan(cmd));
  return child_process.execSync(cmd)
}

const polymerCli = 'node node_modules/polymer-cli/bin/polymer.js '

gulp.task('sass', function () {
  return gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('html', function() {
  template = fs.readFileSync('index.html', 'utf-8')
  parts = template.split('<!-- CONTENT -->')
  return gulp.src('./pages/**/*.html')
    .pipe(insert.wrap(parts[0], parts[1]))
    .pipe(gulp.dest('./public'))
});

gulp.task('shared-styles', ['sass'], function() {
  gutil.log('Reading base.css into shared styles')
  base_css = fs.readFileSync('./public/css/app.css')
  content = `<link rel="import" href="../node_modules/@bower_components/polymer/polymer-element.html">
<link rel="stylesheet" href="../node_modules/typeface-muli/index.css">
<dom-module id="shared-styles">
  <template>
    <style>

      `+base_css+`

    </style>
  </template>
</dom-module>`
  return fs.writeFileSync('./elements/shared-styles.html', content)
})

gulp.task('dist', ['html', 'sass'], () => {
  return merge(...[
    gulp.src('./public/**/*')
      .pipe(gulp.dest('./dist')),
    gulp.src('./elements/**/*')
      .pipe(gulp.dest('./dist/elements/')),
    gulp.src('./node_modules/typeface-muli/**/*')
      .pipe(gulp.dest('./dist/node_modules/typeface-muli/')),
    gulp.src('./node_modules/@bower_components/**/*')
      .pipe(gulp.dest('./dist/node_modules/@bower_components/')),
  ])
})
gulp.task('serve-dist', ['dist'], serve({
  root: ['dist'],
  port: 1313,
}))

gulp.task('watch', ()=>{
  gulp.watch('sass/**/*.scss', ['shared-styles'])
  return gulp.watch('pages/**/*.html', ['html'])
})

gulp.task('serverun', serve({
    root: ['public', '.'],
    port: 1313,
  })
)
gulp.task('serve', ['html', 'sass', 'serverun'], () => {
  return gulp.start('watch')
})

gulp.task('default', ['serve'])
