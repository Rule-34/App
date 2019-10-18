// Gulp.js configuration

const
    // modules
    gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    htmlclean = require('gulp-htmlclean'),
    postcss = require('gulp-postcss'),
    assets = require('postcss-assets'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    purgecss = require('@fullhuman/postcss-purgecss'),
    terser = require('gulp-terser'),
    del = require("del"),

    tailwind = require('tailwindcss'), // Added for MR34

    // Directories
    dirSource = './src/',
    dirDistribution = './dist/',

    // CSS Processors settings
    cssProcessors = [
        autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            cascade: false
        }),
        tailwind()
    ],

    minifiers = [
        cssnano(),
        assets({
            loadPaths: ['img/', 'fonts/'],
            relative: true
        })
    ],

    // Image processing settings
    imageSettings = [

        imagemin.gifsicle({
            interlaced: true
        }),
        imagemin.jpegtran({
            progressive: true
        }),
        imagemin.optipng({
            optimizationLevel: 5
        }),
        imagemin.svgo({
            plugins: [{
                removeViewBox: true
            },
            {
                cleanupIDs: false
            }
            ]
        })
    ];

let out = '';

// ----------- HTML minifying ----------- // 

// HTML Minifier
function html() {
    const out = dirDistribution;

    return gulp.src(dirSource + '**/*.html')
        .pipe(htmlclean())
        .pipe(gulp.dest(out));
}
exports.html = html;

// ----------- Image tampering ----------- // 

// Image processing
function images() {

    out = dirDistribution + 'img/';
    return gulp
        .src(dirSource + 'img/**/*')
        .pipe(imagemin(imageSettings))
        .pipe(gulp.dest(out));

}
exports.images = images;

// ----------- CSS ----------- // 

// CSS compiling
function cssCompile() {
    out = dirDistribution;

    return gulp
        .src(dirSource + '**/*.css')
        .pipe(postcss(cssProcessors))
        .pipe(gulp.dest(out));

}
exports.csscompile = cssCompile;

// CSS minifying
function cssMinify() {
    out = dirDistribution;

    return gulp
        .src([dirDistribution + '**/*.css', '!' + dirDistribution + '**/*.min.css'])
        .pipe(postcss(minifiers))
        /* .pipe(rename({
            suffix: '.min'
        })) */
        .pipe(gulp.dest(out));

}
exports.cssminify = cssMinify;

// ----------- JavaScript ----------- //

function jsCompile() {
    out = dirDistribution;

    return gulp
        .src([dirSource + "**/*.js"])
        // .pipe(eslint())
        // .pipe(eslint.format())
        // .pipe(eslint.failAfterError())
        .pipe(gulp.dest(out));

}
exports.jscompile = jsCompile;

function jsMinify() {
    out = dirDistribution;

    return gulp
        .src([dirDistribution + "**/*.js", "!" + dirDistribution + "**/*.min.js"])
        .pipe(terser({
            keep_fnames: true,
            mangle: false
        }))
        /* .pipe(rename({
            suffix: '.min'
        })) */
        .pipe(gulp.dest(out));

}
exports.jsminify = jsMinify;

// ----------- Utilities ----------- //

function moveFonts() {
    out = dirDistribution + "fonts/";

    return gulp
        .src([dirSource + "fonts/*"])
        .pipe(gulp.dest(out));
}
exports.moveFonts = moveFonts;

// Delete production directory
function clean() {
    return del("./dist");
}
exports.clean = clean;

// ----------- Utilities for developing ----------- // 

exports.build = gulp.series(clean, html, cssCompile, jsCompile, gulp.parallel(cssMinify, jsMinify, images, moveFonts));