var extend = require('extend');
var which = require('which');
var GitRun = require('./git_run');
var fs = require('fs');
var async = require('async');

function Git(path, options) {
	this.path = path;

	this.options = extend({
		extraArgs: null,
		binary: null
	}, options);
}

Git.open = function(path, options, cb) {
	if(!cb) {
		cb = options;
		options = null;
	}

	var g = new Git(path, options);

	// Check if it is a git directory

	g._findGit(function(err) {
		if(err) return cb(err);

		g.exec('rev-parse', function(err) {
			cb(err, err ? null : g);
		});
	});
};
Git.clone = function(url, path, options, cb) {
	if(!cb) {
		cb = options;
		options = null;
	}

	var g = new Git(path, options);

	async.waterfall([
		function(cb) {
			g._findGit(cb);
		}, function(cb) {
			fs.mkdir(g.path, function(err) {
				if(err && err.code == "EEXIST") err = null;
				cb(err);
			});
		}, function(cb) {
			g.exec('clone', url, '.', function(err) {
				cb(err);
			});
		}
	], cb);
};
Git.init = function(path, options, cb) {
	if(!cb) {
		cb = options;
		options = null;
	}

	var g = new Git(path, options);

	async.waterfall([
		function(cb) {
			g._findGit(cb);
		}, function(cb) {
			fs.mkdir(g.path, function(err) {
				if(err && err.code == "EEXIST") err = null;
				cb(err);
			});
		}, function(cb) {
			g.exec('init', '.', function(err) {
				cb(err);
			});
		}
	], cb);
};

Git.prototype._findGit = function(cb) {
	var self = this;
	if(this.options.binary) {
		this.binary = this.options.binary;
		return cb();
	}

	which("git", function(err, binary) {
		self.binary = binary;
		return cb(err);
	});
};

Git.prototype.exec = function(cmd) {
	var cb, options;
	var args = Array.prototype.slice.call(arguments, 1);

	if(typeof args[args.length - 1] === 'function')
		cb = args.pop();
	if(typeof args[0] === 'object')
		options = args.shift();

	var gr = new GitRun(this, cmd, options, args);

	if(cb) {
		gr.on('end', function() {
			cb(null);
		}).on('error', function(err) {
			cb(err);
		});
	}
	return gr;
};

module.exports = Git;
