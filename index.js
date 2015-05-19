// dependencies
var mplayer = require('node-mplayer'),
    restify = require('restify'),
    fs = require('fs'),
    _ = require('underscore'),
    config = require('config'),
    dir = require('node-dir'),
    changeCase = require('change-case');
// the soundbeard object
var soundbeard = {
    name: 'soundbeard v1',
    player: null,
    server: null,
    init: function() {
        this.player = new mplayer();
        this.player.setVolume(100);
        var that = this;
        this.server = restify.createServer({
            name: that.name
        });
        this.bindRoutes();
        this.launchServer();
    },
    bindRoutes: function() {
        var that = this;
        this.server.get('/play/:folder/:snippet', that.play);
        this.server.get('/play/:snippet', that.play);
        this.server.get('/stop', that.stop);
        this.server.get('/list', that.snippets);
        this.server.get(/.*/, restify.serveStatic({
            directory: 'sites',
            default: 'index.html'
        }));
    },
    launchServer: function() {
        var that = this;
        this.server.listen(config.get('port'), config.get('ip'), function() {
            console.log('%s listening at %s', that.server.name, that.server.url);
        });
    },
    play: function(req, res, next) {
        var path = config.get('sounds') + (_.has(req.params, 'folder') ? req.params.folder + '/' : '') + req.params.snippet;
        fs.exists(path, function(exists) {
            if (exists) {
                soundbeard.player.stop();
                soundbeard.player.setFile(path);
                soundbeard.player.play();
                res.send({
                    playing: req.params.snippet
                });
            } else {
                res.status(404);
                res.send({
                    error: 'could not find soundfile: ' + req.params.snippet
                });
            }
        })
    },
    stop: function(req, res) {
        this.player.stop();
        res.send();
    },
    snippets: function(req, res) {
        var path = config.get('sounds');

        dir.paths(path, function(err, paths) {
            if (err) throw err;

            var filteredFiles = [];
            var list = {};
            var files = fs.readdirSync(path);
            _.each(files, function(file) {
                if (soundbeard.isSoundFile(file)) {
                    filteredFiles.push(file);
                }
            });
            _.each(paths.dirs, function(subdir) {
                var subdirName = subdir.split('/').pop();
                var files = fs.readdirSync(subdir);
                _.each(files, function(file) {
                    if (soundbeard.isSoundFile(file)) {
                        filteredFiles.push(subdirName + '/' + file);
                    }
                });
            });
            filteredFiles.sort();
            _.each(filteredFiles, function(file) {
                list[soundbeard.getReadableName(file)] = soundbeard.buildSoundHref(file);
            });

            res.send(list);
        });
    },
    getReadableName: function(file) {
        var pathSplit = file.split('/');
        var label = '';
        var fileName = file;

        if (pathSplit.length > 1) {
            var label = pathSplit[0]+'/';
            var fileName = pathSplit[1];
        }

        ext = file.split('.').pop();
        fileName = changeCase.titleCase(fileName.replace('.'+ext, ''));
        return label+fileName
    },
    buildSoundHref: function(file) {
        return 'http://' + config.get('ip') + ':' + config.get('port') + '/play/' + file;
    },
    isSoundFile: function(file) {
        if (file[0] == '.' || file == '.' || file == '..') {
            return false;
        }
        var extension = file.split('.').pop();
        return (-1 !== _.indexOf(config.get('allowedFormats'), extension));
    }
};
// startup
soundbeard.init();