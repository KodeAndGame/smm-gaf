let db = require('./lib/db');

console.log('app started');
db.loki.on('loaded', function() {
	console.log('database loaded');
  db.rebuild(function() {
    console.log('database rebuilt');
  })
});

/*
let gaf = require('./lib/gaf-scraper.js'),
	keyIn = require('readline-sync').keyIn;

let posts = {};
let levels = {};

gaf.createStream({
	threadId: 1109852,
	match: /\w{4}-\w{4}-\w{4}-\w{4}/g,
	endPost: 100
})
.on('data', function(obj) {
	console.log(obj.postNumber);
})
.on('error', function(err) {
	console.error(err);
})
*/