var gaf = require('./lib/gaf-scraper.js');

gaf.createStream({
	threadId: 1109852,
	startPost: 3,
	endPost: 5
})
.on('data', function(obj) {
	console.log(obj);
})
.on('end', function() {
	console.log('done');
})
console.log('huh');
/*

let db = require('./lib/db.js');

db.loki.on('loaded', function() {
	console.log('loaded db');
	let posts = db.loki.getCollection('posts');
	console.log(posts.by('postNumber', 8000));
});

let codePattern = /\w{4}-\w{4}-\w{4}-\w{4}/g;
function getLevels() {
	let posts = db.loki.getCollection('posts');
	let levelPosts = posts.find({body: {$regex : codePattern}});
	let levels = db.loki.addCollection('levels');
	levels.ensureUniqueIndex('code');
	let byCode = levels.by('code');

	levelPost.forEach(post => {
		let matches = post.body.match(/\w{4}-\w{4}-\w{4}-\w{4}/g);
		matches.forEach(match => {
			let level = byCode(match);
			if(!level) {
				levels.insert({
					code: match,
					author: post.poster,
					firstAppearcance: null
				})
			}
		});
	});
}
*/