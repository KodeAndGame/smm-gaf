let fs = require('fs'),
	loki = require('lokijs'),
	gaf = require('./gaf-scraper.js'),
	dbFile = __dirname + '/../../data/smm-gaf-db.json',
	db,
  smmGafOtIds = [1109852],
  smmGafMiscIds = [1115465]

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
	})
	.on('data', function(obj) {
		if(post.poster == 'daydream' && post.body.indexOf('http://i.imgur.com/kAlmwzR.png') > 0) {
			post.isCommunityShowcase = true;
		}

		let matches = post.body.match(/\w{4}-\w{4}-\w{4}-\w{4}/g);
    post.levelsMentioned = matches;

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

exports.buildLevelsCollection = function() {
	//TODO -- add starting post for refresh
	let posts = db.getCollection('posts');

	let levels = db.getCollection('levels');
  
  let byTimeView = posts.addDynamicView('byTime');
  let results = byTimeView
  	.applyFind({isCommunityShowcase: {'$ne': true}})
  	.applySimpleSort('time')
  	.data();

  if(!results) {
  	console.log('no applicable posts found');
  	return;
  }
  console.log(`${results.length} applicable posts found`);

  results.forEach(post => {
    let matches = post.body.match(/\w{4}-\w{4}-\w{4}-\w{4}/g);
    matches.forEach(match => {
      if(!levels.by('code', match)) {
        levels.insert({
          code: match,
          author: post.poster,
          firstPost: post.postNumber
        })
      };
    });
  });

  db.saveDatabase();
  console.log('done building levels collection');

  console.log(`${levels.data.length} levels created`);
}

exports.buildCommunityShowcaseColumn = function() {
	let posts = db.getCollection('posts');
	let results = posts.find({'$and' : [
		{body: {'$contains': 'http://i.imgur.com/kAlmwzR.png'}},
		{poster: 'daydream'}
	]});

	if(!results) return;
	console.log(`${results.length} community showcase posts found`);
	results.forEach(post => {
		post.isCommunityShowcase = true;
		posts.update(post);
	})
	
	db.saveDatabase();
	console.log('completed building isCommunityShowcase column');

}

exports.buildLevelsMentionedColumn = function() {
  let posts = db.getCollection('posts');

  posts.data.forEach(post => {
    let matches = post.body.match(/\w{4}-\w{4}-\w{4}-\w{4}/g);
    post.levelsMentioned = matches;
    posts.update(post);
  })

  db.saveDatabase();
  console.log('completed building levelsMentioned column');
}

exports.buildMentionsOtherColumn = function() {
  let posts = db.getCollection('posts'),
    levels = db.getCollection('levels');

  posts.data.forEach(post => {
    post.levelsMentioned.forEach(levelMentioned => {
      let level = levels.by('code', levelMentioned);
      if(level.author != post.poster) {
        post.mentionsOther = true;
      }
    });
  });
  db.saveDatabase();
  console.log('completed building mentionsOther column');
}




/*
	post {
		postNumber
		url
		poster
    subject
    time
    isMod
    body

    levelsMentioned
  	isCommunityShowcase
  	mentionsOther
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
		poster
		creator

		text  (only if poster != creator)
		sentiment (only if poster != creator)
	}
*/