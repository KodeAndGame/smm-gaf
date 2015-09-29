const postsPerPage = 50;

let Xray = require('x-ray'),
  through = require('through'),
  url = require('url'),
  unarray = require('./unarray-stream'),
  moment = require('moment'),
  xray = Xray();

let exports = module.exports = {};

exports.createStream = function (options) {
  options = initOptions(options);

  let ret = xray(
    `http://www.neogaf.com/forum/showthread.php?t=${options.threadId}&page=${options.startPage}`, 
    'div[id^=edit]', 
    [{
      postCount: '.post-meta .right strong',
      url: '.post-meta .right a@href',
      poster: '.postbit-details-username a',
      subject: '.post-meta-border strong', 
      time: '.postbit-details-usertitle + .smallfont',
      altTime: '.postbit-details-username + .smallfont',
      isMod: '.postbit-details-username a span@style',
      body: '.post@html'
    }]);

  //if (options.delay) ret.delay(delay);
  if (options.startPage != options.endPage) ret = ret.paginate('a[rel="next"]@href');
  if (options.endPage > 0) ret = ret.limit(options.endPage - options.startPage + 1);


  return ret.write()
      .on('error', function(err) {
        console.error(err);
      })
      .pipe(unarray)
      .pipe(through(function(data) {
        data.threadId = options.threadId;
        data.postId = url.parse(data.url, true).query.p
        data.id = `${data.threadId}|${data.postCount}`;
        data.postNumber = parseInt(data.postNumber, 10);
        if(data.postNumber < options.startPost || (data.postNumber > options.endPost && options.endPost > 0)) {
          return;
        }

        if(options.match) {
          if(!data.body.match(options.match)) {
            return;
          }
        }

        //remove excess whitespace
        data.body = data.body
          .replace(/[\r\n\t]/g, '')

        //reset to an actual bool as opposed to truthiness
        data.isMod = data.isMod ? true : false; 

        //reset date/time to a moment
        data.time = data.time || data.altTime;
        let found = data.time.match(/\([\w\d-]*,[\s\d:\w]*\)/g);
        if(found) {
          data.time = found[0]
            .replace('(', '')
            .replace(')', '')
            .replace('Today', moment.utc().format('MM-DD-YYYY'))
            .replace('Yesterday', moment.utc().subtract(1, 'days').format('MM-DD-YYYY'));
          data.time = moment.utc(data.time, 'MM/DD/YYYY, h:mm P')
        }
        else {
          this.emit('error', `unable to parse the date-time: ${data.time}`);
        }

      this.emit('data', data); 
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