// dependencies
var mplayer = require('mplayer'),
    restify = require('restify'),
    fs = require('fs'),
    _ = require('underscore'),
    config = require('config'),
    dir = require('node-dir'),
    changeCase = require('change-case'),
    httpreq = require('httpreq');
// the soundbeard object
var soundbeard = {
    name: 'soundbeard v1',
    player: null,
    server: null,
    snippet_list: null,
    init: function() {
        this.checkConfig();
        this.player = new mplayer();
        this.player.volume(100);
        var that = this;
        this.server = restify.createServer({
            name: that.name
        });
        this.server.use(restify.bodyParser());
        this.bindRoutes();
        this.launchServer();
    },
    checkConfig: function() {
        var keys = ['ip', 'port', 'sounds', 'allowedFormats'];
        _.each(keys, function(key) {
            if (!config.has(key)) {
                console.log('WARNING: Config property "'+key+'" does not exists. Exiting...');
                process.exit(1);
            }
        });
    },
    bindRoutes: function() {
        var that = this;
        this.server.get('/play/:folder/:snippet', that.play);
        this.server.get('/play/:snippet', that.play);
        this.server.get('/stop', that.stop);
        this.server.post('/say', that.say);
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
                soundbeard.player.openFile(path);
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
        soundbeard.player.stop();
        res.send();
    },
    say: function(req, res) {
        soundbeard.speech(req, res);
    },
    speech: function(req, res) {
        if (undefined == req.params.text) {
            res.status(400);
            res.send({
                error: 'no text is given'
            });
        }
        soundbeard.speakToGoogle(req.params.text, function() {
            res.send({
                speaking: req.params.text
            });
        });
    },
    snippets: function(req, res) {
        if(soundbeard.snippet_list == null) {
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
                soundbeard.snippet_list = list;
                res.send(list);
            });
        } else {
            res.send(soundbeard.snippet_list);
        }
    },
    getReadableName: function(file) {
        var pathSplit = file.split('/');
        var label = '';
        var fileName = file;
        if (pathSplit.length > 1) {
            var label = pathSplit[0] + '/';
            var fileName = pathSplit[1];
        }
        ext = file.split('.').pop();
        fileName = changeCase.titleCase(fileName.replace('.' + ext, ''));
        return label + fileName
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
    },
    speakToGoogle: function(text, callback) {
        var that = this;
        var savePath = __dirname + '/'+this.getRandomString()+'.mp3';
        var lang = config.has('tts_lang') ? config.get('tts_lang') : 'de';
        var url = 'http://translate.google.com/translate_tts?tl='+lang+'&q='+text;
        httpreq.get(url, {
            binary: true,
            headers: {
                // this is a stupid fix for the picky Google TTS API
                "User-Agent": "Chrome/43.0.2357.130 Safari/537.36"
            }
        }, function(err, res) {
            fs.writeFile(savePath, res.body, function(fileErr) {
                console.log(savePath)
                that.player.openFile(savePath);
                that.player.play();
                setTimeout(function() {
                    fs.unlink(savePath);
                }, 10000);

                if (typeof(callback) == 'function') {
                    callback();
                }
            });
        });
    },
    getRandomString: function() {
        return 'snippet_'+Math.random().toString(36).substring(7);
    }
};
// startup
soundbeard.init();
