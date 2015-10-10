let http = require('http')

let httpMatch = function(url, regexp) {
  return new Promise(function (resolve, reject) {
    http.get(url,
      function(res) {
        let body = '';
        res.on('data', function(d) {
            body += d;
        });
        res.on('end', function() {
          body = body.substring(
            body.indexOf('<body'), 
            body.indexOf('</body>')
          )
          resolve(body.match(regexp))
        });
        res.on('error', function(e) {
          reject(e)
        })
      })
  })
}

module.exports = httpMatch