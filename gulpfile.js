var gulp = require('gulp');
var webserver = require('gulp-webserver');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyhtml = require('gulp-minify-html');
var sass = require('gulp-sass');
var css = require('gulp-minify-css');
var livereload = require('gulp-livereload');
var connect = require('gulp-connect');
var history = require('connect-history-api-fallback');

var src = 'public/src';
var dist = 'public/dist';
var neg_src = '!public/src';

var paths = {
	js: [neg_src+'/js/*.min.js', src + '/js/controller/*.js'],
	scss: src + '/scss/*.scss',
	css : src + '/css/*.css',
	html: src + '/**/*.html'
};

// 웹서버를 localhost:8000 로 실행한다.
gulp.task('server', function () {
	connect.server({
		root : src,
		livereload : true,
		// middleware: function(connect, opt) {
  //    		return [ history ];
  //  		}
	});
});

// 자바스크립트 파일을 하나로 합치고 압축한다.
gulp.task('combine-js', function () {
	return gulp.src(paths.js)
		//.pipe(uglify())
		.pipe(gulp.dest(dist + '/js'));
});

// sass 파일을 css 로 컴파일한다.
gulp.task('compile-sass', function () {
	return gulp.src(paths.scss)
		.pipe(sass())
		//.pipe(gulp.dest(dist + '/css'));
		.pipe(gulp.dest(src + '/css'));
});

gulp.task('compile-css', function() {
	return gulp.src(paths.css)
		.pipe(css())
		//.pipe(gulp.dest(dist + '/css'));
		.pipe(gulp.dest(src + '/css'));
})

// HTML 파일을 압축한다.
gulp.task('compress-html', function () {
	return gulp.src(paths.html)
		//.pipe(minifyhtml())
		.pipe(gulp.dest(dist + '/'));
});

// 파일 변경 감지 및 브라우저 재시작

gulp.task('watch', function () {
	livereload.listen();
	gulp.watch(paths.js, ['combine-js']);
	gulp.watch(paths.scss, ['compile-sass']);
	//gulp.watch(paths.css, ['compile-css']);
	gulp.watch(paths.html, ['compress-html']);
	gulp.watch(dist + '/**')
	.on('change', livereload.changed);
});

//기본 task 설정
gulp.task('default', [
	'server',
	//'combine-js', 
	'compile-sass', 
	//'compile-css', 
	'compress-html', 
	'watch'
	
	]);
