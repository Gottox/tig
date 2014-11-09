var assert = require("assert");
var mktemp = require("mktemp");

var tig = require("../");

var tmpRepo = mktemp.createDirSync("/tmp/tig-XXX");

describe('tig', function() {
	describe('.init()', function() {
		it('should create new repository', function(done) {
			tig.init(tmpRepo, function(err, git) {
				if(err) throw err;
				done();
			});
		});
		it('shoud create directory if not exist', function(done) {
			tig.init(tmpRepo + "2", function(err, git) {
				if(err) throw err;
				done();
			});
		});
	});
	describe('.open()', function() {
		it('should open an existing repository', function(done) {
			tig.open(tmpRepo, function(err, git) {
				if(err) throw err;
				done();
			});
		});
		it('should fail if path is no git repository', function(done) {
			tig.open("/", function(err, git) {
				if(!err) throw new Error("should throw");
				done();
			});
		});
	});
	describe('.clone()', function() {
		it('should clone an existing repository', function(done) {
			tig.clone(tmpRepo, tmpRepo + "clone", function(err, git) {
				if(err) throw err;
				done();
			});
		});
	});

	describe('#log', function() {
		it('should open the log', function(done) {
			tig.open(".", function(err, git) {
				git.log(function(logs) {
					done();
				});
			});
		});
	});
});

