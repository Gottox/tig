var child_process = require('child_process');
var util = require('util');
var readline = require('readline');
var extend = require('extend');
var Linerstream = require('linerstream');

function GitRun(git, cmd, options, args) {
	var self = this;
	var execArgs = [ cmd ];
	execArgs = execArgs.concat(
		this._formatOptions(git.options.extraArgs || []),
		this._formatOptions(options || []),
		['--'], args);

	this.child = child_process.spawn(git.binary, execArgs, { cwd: git.path })
		.on('exit', function(code, signal) {
			if(code === 0)
				return self.emit('end');
			self.emit('error', new Error("Exit code " + code + "\n" + execArgs.join(',')));
		})
		.on('error', function(err) {
			err.message += "\n" + execArgs.join(',');
			self.emit('error', err);
			self.removeAllListeners();
		});
	this.stderr = this.child.stderr.pipe(new Linerstream())
		.on('data', function(line) {
			self.emit('stderr', line);
		});
	this.stderr = this.child.stdout.pipe(new Linerstream())
		.on('data', function(line) {
			self.emit('stdout', line);
		});
	this.child.stdin.end();
}
util.inherits(GitRun, require('events').EventEmitter);

GitRun.prototype._formatOption = function(option) {
	if(option.length === 1)
		return '-'+option;
	return '--'+option;
};

GitRun.prototype._formatOptions = function(options) {
	if(util.isArray(options))
		return options.slice().map(this._formatOption);

	var result = [];
	var keys = Object.keys(options);

	for(i = 0; i < keys.length; i++) {
		option = options[keys[i]];
		if(option === false || option === undefined || option === null)
			continue;

		result.push(this._formatOption(keys[i]));
		if(option !== true)
			result.push(option);
	}
};

module.exports = GitRun;
