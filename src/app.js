let data = require('./lib/data'),
  debug = require('debug')('smm-gaf-app')

let prompt =
`-------------------------------------------------
Super Mario Maker + NeoGAF Recommendation Engine
-------------------------------------------------

What would you like to do:
1 - Test Database Load
2 - Test Database Build
3 - Test Database Refresh
4 - Test Database Reschema
0 - Quit`

console.log(prompt)
process.stdin.resume()
process.stdin.on('data', function(text) {
  text = text.toString().replace(/[\r\n]/g, '')
  switch (text) {
    case '0':
      process.exit(0)
    case '1':
      dbLoad()
      break
    case '2':
      dbBuild()
      break
    case '3':
      dbRefresh()
      break
    case '4':
    dbReschema()
      break
    default:
      console.log('try again')
      console.log(prompt)
      process.stdin.resume()
  }  
})

function dbLoad() {
  data.load()
  .then(function() {
    debug('closing database')
    data.db.close();
    console.log(prompt)
    process.stdin.resume()
  })
}

function dbBuild() {
  data.build()
  .then(data.refresh)
  .then(function() {
    debug('closing database')
    data.db.close();
    console.log(prompt)
    process.stdin.resume()
  })
}

function dbRefresh() {
  data.load()
  .then(data.refresh)
  .then(function() {
    debug('closing database')
    data.db.close();
    console.log(prompt)
    process.stdin.resume()
  })
}

function dbReschema() {
  data.load()
  .then(data.reschema)
  .then(function() {
    debug('closing database')
    data.db.close();
    console.log(prompt)
    process.stdin.resume()
  })
}