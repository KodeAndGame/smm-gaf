let cheerio = require('cheerio'),
  consts = require('./constants'),
  url = require('url')
let exports = module.exports = {}

exports.applySchema = function(post, thread) {
  post.friendlyId = `${post.threadId}|${post.postCount}`

  post.isCommunityContest = 
    post.poster == 'daydream' 
      && post.body.includes('http://i.imgur.com/0GhLSDz.png') 
      && thread.isOt

  post.isCommunityShowcase = 
    post.poster == 'daydream' 
    && post.body.includes('http://i.imgur.com/kAlmwzR.png') 
    && thread.isOt    

  let levelsMentioned = []

  //search for level code in body
  let found = post.body.match(consts.levelCodeRegex)
  if(found) levelsMentioned = levelsMentioned.concat(found)

  //check links for level codes
  let $ = cheerio.load(post.body),
    gafLinks = [],
    miiLinks = [],
    links = [],
    images = []
  
  $('a').each(function(i, elem) {
    let href = elem.attribs['href']
    let parsedHref = url.parse(href)
    if(!parsedHref)
      return

    if(parsedHref.hostname.includes('neogaf') || parsedHref.hostname.includes('67.227.255.239')) {
      gafLinks.push(href)
    }
    else if(parsedHref.hostname.includes('miiverse')) {
      miiLinks.push(href)
    }
    else {
      links.push(href)
    }
  })
  $('img').each(function (i, elem) {
    images.push(elem.attribs['src'])
  })

  if(miiLinks.length > 0) {
    console.log(post.friendlyId)
    console.log(miiLinks)
  }


  if(levelsMentioned.length > 0) {
    post.levelsMentioned = levelsMentioned
  }

  return post
}



  
  /*
  httpMatch('http://www.neogaf.com/forum/showthread.php?t=1109852', 
    /\w{4}-\w{4}-\w{4}-\w{4}/g)
    .then(function(data) {
      console.log(data)
    })
  */