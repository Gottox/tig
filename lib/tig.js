var Git = require('./git');
var p_fatal = /^fatal: /;

module.exports = {
	open: Git.open,
	clone: Git.clone,
	init: Git.init
};
