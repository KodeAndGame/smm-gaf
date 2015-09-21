let db = require('./lib/db'),
  debug = require('./lib/debug-collection'),
  fs = require('fs');

console.log('app started');
db.loki.on('loaded', function() {
  console.log('db loaded');

  db.buildMentionsOtherColumn();
});



  /*
    posts = db.loki.getCollection('posts');

  console.log(levels.data.length);
  let unplayedLevels = [];
  levels.data.forEach(level => {
    let results = posts.find({'$and': [
      {body: {'$contains': level.code}},
      {poster: {'$ne': level.author}}
    ]});

    if(!results || results.length == 0) {
      //level.url = posts.by('postNumber', level.firstPost).url;
      unplayedLevels.push(level);
    }
  })

  console.log(unplayedLevels.count);
  console.log('writing file');
  fs.writeFile('/tmp/test.json', unplayedLevels);
  console.log('done writing');
  */