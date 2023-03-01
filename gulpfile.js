var syntax = "scss", // Syntax: sass or scss;
  gulpVersion = "4"; // Gulp version: 3 or 4
gmWatch = false; // ON/OFF GraphicsMagick watching "img/_src" folder (true/false). Linux install gm: sudo apt update; sudo apt install graphicsmagick

var gulp = require("gulp"),
  // gutil = require("gulp-util"),
  sass = require("gulp-sass")(require('sass')),
  browserSync = require("browser-sync"),
  concat = require("gulp-concat"),
  uglify = require("gulp-uglify"),
  cleancss = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  autoprefixer = require("gulp-autoprefixer"),
  notify = require("gulp-notify"),
  del = require("del"),
  replace = require('gulp-replace'),
  fs = require('fs'),
  sourcemaps = require('gulp-sourcemaps');

const purgecss = require("gulp-purgecss");

// Local Server
gulp.task("browser-sync", function() {
  browserSync({
    server: {
      baseDir: "app"
    },
    notify: false
    // open: false,
    // online: false, // Work Offline Without Internet Connection
    // tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
  });
});

// Sass|Scss Styles
gulp.task("styles", function() {
  return gulp
    .src("app/" + syntax + "/**/*." + syntax + "")
    .pipe(sourcemaps.init())
    .pipe(sass({includePaths: ['node_modules'], outputStyle: "expanded" }).on("error", notify.onError()))
    // .pipe(purgecss({ content: ["app/*.html"] }))
    .pipe(rename({ suffix: ".min", prefix: "" }))
    .pipe(autoprefixer(["last 15 versions"]))
    .pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
    .pipe(gulp.dest("app/css"))
    .pipe(browserSync.stream());
});

gulp.task("purgecss", () => {
  return gulp
    .src("app/css/*.css")
    .pipe(
      purgecss({
        content: ["app/*.html"]
      })
    )
    .pipe(gulp.dest("app/css"));
});

gulp.task("internal-css", () => {
  return gulp.src("app/index.html")
    .pipe(replace(/<link href="css\/main.min.css"[^>]*>/, function(s) {
      var style = fs.readFileSync('app/css/main.min.css', 'utf8');
      return '<style>\n' + style + '\n</style>';
  }))
  .pipe(gulp.dest("app/build"));
});



// JS
gulp.task("scripts", function() {
  return (
    gulp
      .src([
        "app/js/jquery.waypoints.min.js",
        "app/js/hackclass.js",
        "node_modules/slick-carousel/slick/slick.js",
        "app/js/common.js", // Always at the end
      ])
      .pipe(concat("scripts.min.js"))
      .pipe(uglify()) // Mifify js (opt.)
      .pipe(gulp.dest("app/js"))
      .pipe(browserSync.reload({ stream: true }))
  );
});

// HTML Live Reload
gulp.task("code", function() {
  return gulp.src("app/*.html").pipe(browserSync.reload({ stream: true }));
});

gulp.task('build-html', function () {
	return gulp.src('app/index.html')
	  .pipe(gulp.dest('app/build/'));
  });

gulp.task('build-css', function() {
  return gulp.src('app/css/main.min.css')
  .pipe(gulp.dest('app/build/css/'))
});

gulp.task("build-img", function() {
  return gulp
    .src("app/img/*.*")
    .pipe(gulp.dest("app/build/img/"));
});

gulp.task('clean-build', function() {
	return del(['app/build/**/*.*'], { force:true })
});

gulp.task('build-font', function() {
	return gulp.src('app/fonts/*.*')
	.pipe(gulp.dest('app/build/fonts/'))
});

gulp.task("watch", function() {
  gulp.watch(
    "app/" + syntax + "/**/*." + syntax + "",
    gulp.parallel("styles")
  );
  gulp.watch("app/*.html", gulp.parallel("code"));
});

gulp.task(
      "default",
      gulp.parallel("styles", "browser-sync", "watch")
    );

gulp.task(
  "build",
  gulp.series("styles", "clean-build", "build-html", "build-css", "build-img")
);
