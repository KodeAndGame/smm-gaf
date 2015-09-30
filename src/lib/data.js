let fs = require('fs'),
	loki = require('lokijs'),
  Promise = require('bluebird'),
  debug = require('debug')('smm-gaf-data'),
	gaf = require('./gaf-scraper.js'),
	dbpath = __dirname + '/../../data/smm-gaf-db.json',
  threadConfigs = require('../../data/threads.json'),
	db

module.exports = Data()

function Data() {
  if (!(this instanceof Data)) return new Data;

  var self = this
  this.db = null
  this.posts = null
  this.threads = null

  this.load = function (cb){
    debug('loading database')
    this.db = new loki(dbpath, {
      autoload: true,
      autosave: true, 
      autosaveInterval: 10000
    })
    if(cb) this.db.on('loaded', cb)
  }

  this.build = function(cb) {
    debug('deleting existing database')
    try {
      fs.unlinkSync(dbpath)
    }
    catch (err) {
      if(err.message.indexOf('ENOENT') < 0) {
        cb(new Error('could not delete existing database'))
      }
    }
    
    debug('creating new database file')
    fs.closeSync(fs.openSync(dbpath, 'w'))
    
    //load db
    this.load(function() {
      createThreadsCollection()
      createPostsCollection()
      self.refresh(cb)
    })
  }

  this.refresh  = function(cb) {
    let stale = self.threads.getDynamicView('stale').data();
    Promise.map(stale, refreshThread)
      .then(function() {
        cb()
      })    
  }

  let createThreadsCollection = function() {
    debug('creating threads collection')
    self.threads = self.db.addCollection('threads')
    self.threads.ensureUniqueIndex('threadId')

    threadConfigs.forEach(config => {
      config.latestPost = 0;
      self.threads.insert(config);
    })

    function staleFilter(thread) {
      return !thread.finalPost || thread.latestPost < thread.finalPost;
    }

    let stale = self.threads.addDynamicView('stale')
    stale.applyFind(staleFilter);
  }

  let createPostsCollection = function() {
    debug('creating posts collection')
    self.posts = self.db.addCollection('posts')
    self.posts.ensureUniqueIndex('gafId')
    self.posts.ensureUniqueIndex('id')
  }

  let refreshThread = function(thread) {
    return new Promise(function (resolve, reject) {
      debug('refreshing thread: %s', thread.threadId)
      resolve()
      
      gaf.createStream({
        threadId: thread.threadId,
        startPost: thread.latestPost,
        endPost: thread.finalPost
      }).on('data', function(post) {
        //do something with each post
        //debug(`${post.threadId} | ${post.postCount}`)
      }).on('end', resolve)
    })    
  }
}

let rebuild = function(cb) {
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

let buildLevelsCollection = function() {
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

let buildCommunityShowcaseColumn = function() {
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

let buildLevelsMentionedColumn = function() {
  let posts = db.getCollection('posts');

  posts.data.forEach(post => {
    let matches = post.body.match(/\w{4}-\w{4}-\w{4}-\w{4}/g);
    post.levelsMentioned = matches;
    posts.update(post);
  })

  db.saveDatabase();
  console.log('completed building levelsMentioned column');
}

let buildMentionsOtherColumn = function() {
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
  thread {
    threadId
    isOt
    nothingToRefresh
  }

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