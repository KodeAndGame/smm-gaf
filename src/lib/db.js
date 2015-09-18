let fs = require('fs'),
	loki = require('lokijs'),
	Xray = require('x-ray'),
	unarray = require('./unarray-stream')

let xray = Xray(),
	dbFile = __dirname + '/../../data/smm-gaf-db.json',
	db	

//TODO: 

let loadDb = function() {
	db = new loki(dbFile, {
		autoload: true,
		autosave: true, 
		autosaveInterval: 10000,
		autoloadCallback: function() {
			let posts = db.getCollection('posts')
			if(!posts) {
				posts = db.addCollection('posts')
			}
			//TODO: Refresh data if there's already some there
			//TODO: need to decouple datascraping and data building
			if(posts.data.length == 0) {
				xray('http://www.neogaf.com/forum/showthread.php?t=1109852', 'div[id^=edit]', [{
						postNumber: '.post-meta .right strong',
						poster: '.postbit-details-username a',
						subject: '.post-meta-border strong', 
						body: '.post'
					}])
					.paginate('a[rel="next"]@href')
					.write()
					.pipe(unarray)
					.on('data', function(obj) {
						posts.insert(JSON.parse(obj));
					})
					.on('end', function() {
						db.saveDatabase();
					})
					.on('error', function (err) {
						console.error(err);
					})
			}
		}
	})
}()

module.exports = db