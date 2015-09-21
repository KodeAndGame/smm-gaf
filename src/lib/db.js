let fs = require('fs'),
	loki = require('lokijs'),
	gaf = require('./gaf-scraper.js'),
	dbFile = __dirname + '/../../data/smm-gaf-db.json',
	db	

module.exports = exports = {};

let loadDb = function() {
	db = new loki(dbFile, {
		autoload: true,
		autosave: true, 
		autosaveInterval: 10000
	})
	exports.loki = db
}()

exports.rebuild = function(cb) {
	buildPostCollection(cb);
}

function buildPostCollection(cb) {
	let posts = db.addCollection('posts');
	let notificationLimit = 100;
	let nextNotification = notificationLimit;
	let count = 0;

	gaf.createStream({
		threadId: 1109852,
		match: /\w{4}-\w{4}-\w{4}-\w{4}/
	})
	.on('data', function(obj) {
		posts.insert(obj);

		count++; 
		if(obj.postNumber > nextNotification) {
			console.log(`${nextNotification} records processed. ${count} records saved.`);
			nextNotification += notificationLimit;
			db.saveDatabase();
		}
	})
	.on('end', function() {
		db.saveDatabase();
		cb();
	})
	.on('error', function (err) {
		console.error(err);
	});
}

function buildAdditionalCollections() {
	let posts = db.getCollection('posts');
	
	let levels = db.addCollection('levels');
	levels.ensureUniqueIndex('code');

	let users = db.addCollection('users');
	users.ensureUniqueIndex('name');

	let mentions = db.addCollection('mentions');
}



/*
	post {
		postNumber
		poster
    subject
    time
    isMod
    body
    //TODO: url
    //TODO: self promotional only?
	}

	postBody {
		[{
			paragraphOrQuote
			containsCode
			text
		}]
	}

	user {
		name
		isMod
		reputation
	}

	level {
		code
		author
		firstPost
	}

	mention {
		level
		text
		poster
		creator
		sentiment (only if poster != creator)
	}
*/