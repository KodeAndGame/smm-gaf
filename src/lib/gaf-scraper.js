const postsPerPage = 50;
let Xray = require('x-ray'),
  filter = require('stream-filter'),
  transform = require('stream-transform'),
  unarray = require('./unarray-stream'),
  xray = Xray();

let exports = module.exports = {};

exports.createStream = function (options) {
  options = initOptions(options);

  let ret = xray(`http://www.neogaf.com/forum/showthread.php?t=${options.threadId}`, 'div[id^=edit]', [{
        postNumber: '.post-meta .right strong',
        poster: '.postbit-details-username a',
        subject: '.post-meta-border strong', 
        body: '.post'
      }]);

  if(options.startPage != options.endPage) ret = ret.paginate('a[rel="next"]@href');
  if(options.endPage > 0) ret = ret.limit(options.endPage - options.startPage);

  return ret.write()
      .pipe(unarray)      
      .pipe(filter(function (data) {
        let n = parseInt(data.postNumber, 10);
        return n >= options.startPost && (n <= options.endPost || options.endPost < 0);
      }));

}

let postToPage = function (post) {
  return Math.ceil(post / postsPerPage);
}
let pageToPost = function (page) {
  return page * postsPerPage + 1;
}

let initOptions = function (options) {
  if(!options || !options.threadId) {
    throw new Error("No Thread ID specified");
  }

  options.startPost = options.startPost
    ? options.startPost
    : options.startPage
    ? pageToPost (options.startPage)
    : 1;

  options.endPost = options.endPost 
    ? options.endPost
    : options.endPage
    ? pageToPost (options.endPage)
    : -1;

  if(options.endPost > 0 && options.endPost < options.startPost) {
    options.endPost = options.startPost;
  }

  options.startPage = options.startPage
    ? options.startPage
    : options.startPost  < 1
    ? options.startPost
    : postToPage (options.startPost);

  options.endPage = options.endPage 
    ? options.endPage
    : options.endPost < 1 
    ? options.endPost
    : postToPage(options.endPost);

  return options;
}

let testOptions = function (options) {
  console.log(initOptions(options));
}

let testOptionsRun = function () {
  testOptions({
    threadId: 1109852,
    startPost: 0
  });
  testOptions({
    threadId: 1109852,
    startPost: 600
  });
  testOptions({
    threadId: 1109852,
    startPost: 601
  });
  testOptions({
    threadId: 1109852,
    endPost: 601
  });
}