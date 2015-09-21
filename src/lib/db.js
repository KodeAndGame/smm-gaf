let loki = require('lokijs'),
	gaf = require('./lib/gaf-scraper.js'),
	dbFile = __dirname + '/../../data/smm-gaf-db.json',
	db	

let loadDb = function() {
	db = new loki(dbFile, {
		autoload: true,
		autosave: true, 
		autosaveInterval: 10000,
	})
}()

function buildPostCollection() {
	posts = db.addCollection('posts');
	gaf.createStream({threadId: 1109852});
	.on('data', function(obj) {
		posts.insert(obj);
	})
	.on('end', function() {
		db.saveDatabase();
	})
	.on('error', function (err) {
		console.error(err);
	}
}

module.exports.loki = db