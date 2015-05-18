var mplayer = require('node-mplayer')
restify = require('restify')
fs = require('fs')
_ = require('underscore')
config = require('config')
dir = require('node-dir');
var player = new mplayer();

function play(req, res, next) {
    var path = config.get('sounds') + (_.has(req.params, 'folder') ? req.params.folder+'/' : '') + req.params.snippet;
    console.log(req.params, path);
    fs.exists(path, function(exists) {
        if (exists) {
            player.stop();
            player.setFile(path);
            player.play();
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
}

function stop(req, res) {
    player.stop();
    res.send();
}

function snippets(req, res) {
    var path = config.get('sounds');
    dir.paths(path, function(err, paths) {
        if (err) throw err;

        var filteredFiles = [];
        var list = {};

        var files = fs.readdirSync(path);
        _.each(files, function(file) {
            if (isSoundFile(file)) {
                filteredFiles.push(file);
            }
        });

        _.each(paths.dirs, function(subdir) {
            var subdirName = subdir.split('/').pop();
            var files = fs.readdirSync(subdir);
            _.each(files, function(file) {
                if (isSoundFile(file)) {
                    filteredFiles.push(subdirName+'/'+file);
                }
            });
        });

        filteredFiles.sort();
        _.each(filteredFiles, function(file) {
            list[file] = buildSoundHref(file);
        });

        res.send(list);
    });
}

function buildSoundHref(file) {
    return 'http://' + config.get('ip') + ':' + config.get('port') + '/play/' + file;
}

function isSoundFile(file) {
    if (file[0] == '.' || file == '.' || file == '..' ) {
        return false;
    }

    var extension = file.split('.').pop();
    return (-1 !== _.indexOf(config.get('allowedFormats'), extension));
}

var server = restify.createServer({
    name: 'soundbeard v1'
});
server.get('/play/:folder/:snippet', play);
server.get('/play/:snippet', play);
server.get('/stop', stop);
server.get('/list', snippets);
server.get(/\/?.*/, restify.serveStatic({
    directory: './sites/',
    default: 'index.html'
}));
server.listen(config.get('port'), config.get('ip'), function() {
    console.log('%s listening at %s', server.name, server.url);
});