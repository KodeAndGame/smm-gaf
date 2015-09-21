let loki = require('lokijs'),
	gaf = require('./lib/gaf-scraper.js'),
	dbFile = __dirname + '/../../data/smm-gaf-db.json',
	db	

let loadDb = function() {
	db = new loki(dbFile, {
		autoload: true,
		autosave: true, 
		autosaveInterval: 10000
	})
}()

function buildPostCollection() {
	posts = db.addCollection('posts');
	gaf.createStream({
		threadId: 1109852,
		match: /\w{4}-\w{4}-\w{4}-\w{4}/
	})
	.on('data', function(obj) {
		posts.insert(obj);
	})
	.on('end', function() {
		db.saveDatabase();
	})
	.on('error', function (err) {
		console.error(err);
	});
}

function buildLevelsCollection() {
	posts = db.getCollection('posts');
	levels = db.addCollection('levels');
	levels.ensureUniqueIndex('code');
	posts.forEach(post => {
		let matches = post.body.match(/\w{4}-\w{4}-\w{4}-\w{4}/g);
		matches.forEach(match => {
			let level = byCode(match);
			if(!level) {
				levels.insert({
					code: match,
					author: post.poster,
					firstAppearcance: null
				});
			}
		});
	});
}

module.exports.loki = db