var gaf = require('./lib/gaf-scraper.js');

//TODO: error?
gaf.createStream({
	threadId: 1109852,
	match: /\w{4}-\w{4}-\w{4}-\w{4}/g,
	startPost: 1000,
	endPost: 1100
})
.on('data', function(obj) {
	console.log(obj.postNumber);
})
.on('end', function() {
	console.log('done');
})
.on('error', function(err) {
	console.error(err);
})