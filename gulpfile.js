var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat');

var templateParser = require('./templateParser')

gulp.task('parse', function() {
    return gulp.src(['src/components/*.html'])
    .pipe(templateParser(false))
    .pipe(gulp.dest('temp'))
})

gulp.task('concat:js',['parse'],function() {
    return gulp.src(['src/js/app.js','temp/scripts.js'])
    .pipe(concat('app.js'))
    .pipe(gulp.dest('build'))
})

gulp.task('concat:html',['concat:js'],function() {
    return gulp.src(['src/index.html','temp/templates.html'])
    .pipe(concat('index.html'))
    .pipe(gulp.dest('build'))
})

gulp.task('concat:css',['concat:html'],function() {
    return gulp.src(['src/css/global.css','temp/styles.css'])
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('build'))
})

gulp.task('build',['concat:css'], function() {

})

gulp.task('serve',['build'], function() {

    browserSync.init({
            server: "./",
            notify: false,
            open:false,
            port:3000
        });

    gulp.watch("./src/**/*.*", ['build'])
    gulp.watch("./build/**/*.*", browserSync.reload)
})
