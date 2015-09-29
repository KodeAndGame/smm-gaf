let gaf = require('./lib/gaf-scraper');

gaf.createStream({
  threadId: 1004449,
  endPost: 150
}).on('data', function(post) {
  console.log(post.postId + ' - ' + post.postCount + ' - ' + post.id);
})