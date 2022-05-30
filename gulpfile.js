// process.env.DISABLE_NOTIFIER = true;

const {src, dest, parallel, series, watch} = require('gulp');
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();

const htmlmin = require('gulp-htmlmin');
const webpHtml = require('gulp-webp-html-fix');
const retinaHtml = require('gulp-img-retina');

const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');

const svgSprite = require('gulp-svg-sprite');
const newer = require('gulp-newer');

const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');

const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;

const scripts = () => {
	return src([
		'src/js/main.js'
	])
	.pipe(sourcemaps.init())
	.pipe(concat('app.js'))
	.pipe(sourcemaps.write('.'))
	.pipe(dest('src/js/'))
	.pipe(browserSync.stream())
}
const scriptsLibs = () => {
	return src([
		'src/js/libs.js',
		'node_modules/crypto-js/crypto-js.js'
	])
	.pipe(sourcemaps.init())
	.pipe(concat('app-libs.js'))
	.pipe(sourcemaps.write('.'))
	.pipe(dest('src/js/'))
	.pipe(browserSync.stream())
}
const htmlPicture = () => {
	return src('src/*.html')
	.pipe(retinaHtml({
		suffix: {1: '', 2: '@2x'}
	}))
	.pipe(webpHtml())
	.pipe(dest('src/'))
}
const styles = () => {
  return src('src/scss/main.scss')
    .pipe(sourcemaps.init())
		.pipe(sassGlob())
    .pipe(sass({ outputStyle: 'expanded' })
		.on('error', notify.onError()))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('src/css/'))
    .pipe(browserSync.stream());
}
const svg = () => {
	return src('src/img/src/*.svg')
		.pipe(newer('src/img/'))
		.pipe(dest('src/img/'));
}
const sprite = () => {
	return src('src/img/sprite/*.svg')
		.pipe(svgSprite({ mode: { stack: { sprite: "../sprite.svg" } } }))
		.pipe(dest('src/img/'));
}
const fonts = () => {
  src('src/fonts/src/*.ttf')
		.pipe(newer({dest: 'src/fonts/', ext: '.woff'}))
		.pipe(ttf2woff())
		.pipe(dest('src/fonts'))
	return src('src/fonts/src/*.ttf')
		.pipe(newer({dest: 'src/fonts/', ext: '.woff2'}))
		.pipe(ttf2woff2())
		.pipe(dest('src/fonts/'))
}
const watchFiles = () => {
  browserSync.init({
        server: { baseDir: "./src" },
        cors: true,
        notify: false,
        ui: false,
    });
    watch('src/*.html').on('change', browserSync.reload);
		watch('src/scss/**/*.scss', styles);
		watch('src/img/src/*.svg', svg);
    watch('src/img/sprite/*.svg', sprite);
		watch('src/fonts/src/*.{ttf,woff,woff2}', fonts);
		watch(['src/**/*.js', '!src/**/app*.*'], scripts);
		watch(['libs/**/*.js'], scriptsLibs);
}

const cleanSrc = () => {
	return del(['src/css/*.*', 'src/fonts/*.*', 'src/img/*.*', 'src/js/*.map', 'src/js/app*.js'])
}

exports.default = parallel(styles, svg, sprite, scripts, scriptsLibs, fonts, watchFiles);
exports.htmlPicture = htmlPicture;
exports.cleanSrc = cleanSrc;

const htmlBuild = () => {
	return src('src/*.html')
		//.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(dest('build'))
}
const stylesBuild = () => {
  return src('./src/css/main.css')
    //.pipe(cleanCSS({ level: 2 }))
    .pipe(dest('build/css/'));
}
const svgBuild = () => {
	return src('src/img/*.svg')
		.pipe(dest('build/img'));
}

const fontsBuild = () => {
	return src('src/fonts/*.{woff,woff2}')
	.pipe(dest('build/fonts'))
}
const resourcesBuild = () => {
  return src('src/resources/**/*')
    .pipe(dest('build/resources'))
}
const scriptsBuild = () => {
	return src('src/js/app.js')
	//.pipe(uglify())
	.pipe(dest('build/js/'))
}
const scriptsLibsBuild = () => {
	return src('src/js/app-libs.js', 'node_modules/crypto-js/crypto-js.js')
	//.pipe(uglify())
	.pipe(dest('build/js/'))
}

const cleanBuild = () => {
	return del('build/*')
}

exports.build = series(cleanBuild, parallel(htmlBuild, stylesBuild, svgBuild, scriptsBuild, scriptsLibsBuild, resourcesBuild, fontsBuild));
exports.cleanBuild = cleanBuild;
