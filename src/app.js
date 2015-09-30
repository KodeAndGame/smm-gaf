let data = require('./lib/data'),
  debug = require('debug')('smm-gaf-app')

data.build(function() {
  debug('closing database')
  data.db.close();
})