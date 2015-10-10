let fs = require('fs'),
  loki = require('lokijs'),
  Promise = require('bluebird'),
  debug = require('debug')('smm-gaf-data'),
  gaf = require('./gaf-scraper.js'),
  postHelper = require('./post-helper'),
  consts = require('./constants'),
  dbpath = __dirname + '/../../data/smm-gaf-db.json',
  threadConfigs = require('../../data/threads.json'),
  db

module.exports = new Data()

function Data() {
  if (!(this instanceof Data)) return new Data;

  let self = this
  this.db = null
  this.posts = null
  this.threads = null

  this.load = function () {
    return new Promise(function (resolve, reject) {
      debug('loading database')
      if (self.db) {
        resolve()
        return
      }

      self.db = new loki(dbpath, {
        autoload: true,
        autosave: true, 
        autoloadCallback: function() {
          self.threads = self.db.getCollection('threads')
          self.posts = self.db.getCollection('posts')
          resolve()
        },
        autosaveInterval: 10000
      })
    })
  }

  this.build = function() {
    return new Promise(function (resolve, reject) {
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
      debug('loading database')
      self.db = new loki(dbpath, {
        autoload: true,
        autosave: true, 
        autosaveInterval: 10000,
        autoloadCallback: function() {
          createThreadsCollection()
          createPostsCollection()
          self.db.saveDatabase()
          resolve()
        }
      })
    })    
  }

  this.refresh  = function() {
    //refresh thread configs
    debug('refreshing thread metadata')
    threadConfigs.forEach(config => {
      debugger
      let thread = self.threads.by('threadId', config.threadId)
      thread = thread || config
      if(!thread.latestPost) thread.latestPost = 0
      thread.finalPost = thread.finalPost < config.finalPost ? config.finalPost : thread.finalPost

      //upsert
      if(thread.$loki) {
        self.threads.update(thread)
      }
      else {
        self.threads.insert(thread)
      }
    })

    debug('refreshing stale threads')
    debugger
    let stale = self.threads.where(staleFilter)
    return Promise.map(stale, refreshThread)
  }

  this.reschema = function() {
    return new Promise(function (resolve, reject) {
      debug('recreating images collection')
      let images = self.db.addCollection('images')
      images.ensureUniqueIndex('url')

      debug('recreating links collection')
      let links = self.db.addCollection('links')
      links.ensureUniqueIndex('url')

      debug('re-applying schema to %s posts', self.posts.data.length)
      let count = 0
      let notificationLimit = 50

      self.posts.data.forEach(post => {
        post = applySchema(post)
        self.posts.update(post)
        if(++count % notificationLimit == 0) {
          debug('%s posts reset', count)
          debug('saving database')
          self.db.saveDatabase()
        }
      })
      resolve()
    })
  }

  let createThreadsCollection = function() {
    debug('creating threads collection')
    self.threads = self.db.addCollection('threads')
    self.threads.ensureUniqueIndex('threadId')
  }

  let createPostsCollection = function() {
    debug('creating posts collection')
    self.posts = self.db.addCollection('posts')
    self.posts.ensureUniqueIndex('postId')
    self.posts.ensureUniqueIndex('friendlyId')
  }

  let refreshThread = function(thread) {
    return new Promise(function (resolve, reject) {
      debug('refreshing thread: %s', thread.threadId)
      let count = 0
      let notificationLimit = 50
      gaf.createStream({
        threadId: thread.threadId,
        startPost: thread.latestPost + 1,
        endPost: thread.finalPost
      }).on('data', function(post) {
        post = applySchema(post)
        post = insertPost(post)

        count++
        if(post.postCount % notificationLimit == 0) {
          debug(`${count} records inserted for ${thread.threadId}. last post was ${post.postCount}`)
          debug('saving database')
          self.db.saveDatabase()
        }
      }).on('end', function() {
        debug(`done refreshing thread: ${thread.threadId}. ${count} records inserted.`)
        debug('saving database')
        self.db.saveDatabase()
        resolve()
      })
    })
  }

  let applySchema = function(post) {
    post = postHelper.applySchema(post, 
      self.threads.by('threadId', post.threadId))

    return post
  }

  let insertPost = function (post) {
    post = self.posts.insert(post)

    //update thread
    let thread = self.threads.by('threadId', post.threadId)
    thread.latestPost = post.postCount
    self.threads.update(thread)

    return post
  }

  let staleFilter = function (thread) {
    return !thread.finalPost || thread.latestPost < thread.finalPost
  }
}

    //TODO: tokenize body
    //possible tags include:
    // b, i, u, strong,     -- these dont matter
    // br, p,               -- these represent text breaks
    // blockquote,          -- if not cited, doesn't matter. if cited treat as one entity
    // img, a               -- these contain an extra step in data mining
    // li                   -- not sure. maybe text fragment

    // remove unnecessary tags
    //let body = post.body
    //  .replace(/<\/?(?!br|p|blockquote|a|img|li|ul)[\w\s]+>/g, '')
