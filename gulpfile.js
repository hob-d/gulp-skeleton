"use strict";

const {src, dest} = require("gulp");
const gulp = require("gulp");
const browserSync = require('browser-sync').create();
const del = require('del');
const autoprefixer = require('gulp-autoprefixer');
const cssbeautify = require('gulp-cssbeautify');
const cssnano = require('gulp-cssnano');
const imagemin = require('gulp-imagemin');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const rigger = require('gulp-rigger');
const sass = require('gulp-sass');
const stripCssComments = require('gulp-strip-css-comments');
const uglify = require('gulp-uglify');
const panini = require('panini');

// Paths
let path = {
  build: {
    html: "dist/",
    js: "dist/assets/js/",
    css: "dist/assets/css/",
    images: "dist/assets/img/"
  },
  src: {
    html: "src/*.html",
    js: "src/assets/js/*.js",
    css: "src/assets/sass/style.scss",
    images: "src/assets/img/**/*.{jpg,png,svg,gif,ico,webp}"
  },
  watch: {
    html: "src/**/*.html",
    js: "src/assets/js/**/*.js",
    css: "src/assets/sass/**/*.scss",
    images: "src/assets/img/**/*.{jpg,png,svg,gif,ico,webp}",
    json: "src/tpl/data/*.json"
  },
  clean: "./dist"
}

// Tasks
function browsersync(done) {
  browserSync.init({
    server: {
      baseDir: "./dist/"
    },
    port: 3000
  });
}

function browsersyncreload(done) {
  browserSync.reload();
}

function html() {
  panini.refresh();
  return src(path.src.html, { base: "src/" })
      .pipe(plumber())
      .pipe(panini({
        root: 'src/',
        layouts: 'src/tpl/layouts/',
        partials: 'src/tpl/partials/',
        helpers: 'src/tpl/helpers/',
        data: 'src/tpl/data/'
      }))
      .pipe(dest(path.build.html))
      .pipe(browserSync.stream());
}

function css() {
  return src(path.src.css, { base: "src/assets/sass/" })
      .pipe(plumber())
      .pipe(sass())
      .pipe(autoprefixer({
        Browserslist: ['last 8 versions'],
        cascade: true
      }))
      .pipe(cssbeautify())
      .pipe(dest(path.build.css))
      .pipe(cssnano({
        zindex: false,
        discardComments: {
          removeAll: true
        }
      }))
      .pipe(stripCssComments())
      .pipe(rename({
        suffix: ".min",
        extname: ".css"
      }))
      .pipe(dest(path.build.css))
      .pipe(browserSync.stream());
}

function js() {
  return src(path.src.js, { base: "src/assets/js" })
      .pipe(plumber())
      .pipe(rigger())
      .pipe(dest(path.build.js))
      .pipe(uglify())
      .pipe(rename({
        suffix: ".min",
        extname: ".js"
      }))
      .pipe(dest(path.build.js))
      .pipe(browserSync.stream());
}

function images() {
  return src(path.src.images)
      .pipe(imagemin())
      .pipe(dest(path.build.images));
}

function clean() {
  return del(path.clean);
}

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.json], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.images], images);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images));
const watch = gulp.parallel(build,watchFiles, browsersync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;