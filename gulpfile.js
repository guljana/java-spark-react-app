const gulp = require('gulp');
const uglify = require('gulp-uglify');
const htmlreplace = require('gulp-html-replace');
const source = require('vinyl-source-stream');
const browserify = require('browserify');
const watchify = require('watchify');
const babelify = require("babelify");
const streamify = require('gulp-streamify');
const del = require('del');
const lint = require('gulp-eslint');
const runSequence = require('run-sequence');
const Karma = require('karma').Server;

const config = {
    clean: ["src/main/resources/public", "reports"],
    dest: 'src/main/resources/public',
    html: {
        sources: './src/webapp/index.html',
        dest: './src/main/resources/public'
    },
    react: {
        entry_point: 'src/webapp/js/App.jsx',
        sources: 'src/webapp/js/*.{js,jsx}',
        dest: 'src/main/resources/public/js',
        script: 'build.js',
        minified_script: 'build.min.js'
    },
    less: {
        sources: 'src/webapp/assets/**/*.{less,css}',
        watch: 'src/webapp/assets/**/*.{less,css}',
        dest: 'src/main/resources/public/css',
    },
    vendor: {
        dest: 'src/main/resources/public/js',
        script: 'vendor.js',
        minified_script: 'vendor.min.js'
    },
    copy: {
        less_assets: {
            sources: 'src/webapp/assets/**/*.svg',
            dest: 'src/main/resources/public/css'
        }
    },
    test: {
        sources: "src/test/js/**/*-spec.{js,jsx}"
    }
};

gulp.task("clean", function(){
    del(config.dest);
});

gulp.task('watch', function() {
    gulp.src(config.html.sources)
        .pipe(htmlreplace({
            'js': ['js/' + config.react.script]
        }))
        .pipe(gulp.dest(config.html.dest));

    gulp.watch(config.html.sources, ['copy']);

    const watcher = watchify(browserify({
        entries: [config.react.entry_point],
        transform: [babelify],
        debug: true,
        cache: {}, packageCache: {}, fullPaths: true
    }));

    return watcher.on('update', function () {
        watcher.bundle()
            .pipe(source(config.react.script))
            .pipe(gulp.dest(config.react.dest))
        console.log('Updated');
    })
        .bundle()
        .pipe(source(config.react.script))
        .pipe(gulp.dest(config.react.dest));
});

gulp.task('build', function(){
    gulp.src(config.html.sources)
        .pipe(htmlreplace({
            'js': ['js/' + config.react.minified_script]
        }))
        .pipe(gulp.dest(config.html.dest));

    browserify({
        entries: [config.react.entry_point],
        transform: [babelify]
    }).bundle()
        .pipe(source(config.react.minified_script))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest(config.react.dest));
});

/**
 * Create vendor bundle
 *
 * All dependencies from package.json's 'dependencies' element are browserified and bundled
 */
gulp.task('vendor', function() {
    const b = browserify({debug: false});

    getNPMPackageIds().forEach(function(id) {
        b.require(resolve.sync(id), {expose: id});
    });
    return bundle(config.vendor.minified_script, config.vendor.dest, b);
});

/**
 * production bundle
 */
gulp.task('production', ()=>{
    runSequence('clean', 'lint', 'set-prod-environment','build')
});

/**
 * By default it's dev mode
 */
gulp.task('default', ()=>{
    runSequence('clean','lint','watch')
});

// Testing

gulp.task("lint", () => (
    gulp.src([config.react.sources, config.test.sources])
        .pipe(lint())
        .pipe(lint.format())
        .pipe(lint.failAfterError())
));

gulp.task("test", ['test-karma']);

gulp.task("test-debug", ['test-karma-debug']);

gulp.task("test-karma", (done) => {
    new Karma({
        configFile: __dirname + '/karma.conf.js',
    }, done).start();
});

gulp.task("test-karma-debug", (done) => {
    new Karma({
        configFile: __dirname + '/karma.conf.js',
        colors: true,
        autoWatch: true,
        singleRun: false,
        browsers: ['Chrome'],
    }, done).start();
});


gulp.task('set-prod-environment', function() {
    process.env.NODE_ENV = 'production';
});


function bundle(name, dest, b) {
    return b.bundle().pipe(source(name))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest(dest));
}