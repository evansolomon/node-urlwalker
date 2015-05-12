var http = require('http')


module.exports.listen = function (port, callback) {
  http.createServer(function (req, res) {
    var handler = handlers[req.url.slice(1)]
    handler(res, '/nothing')
  }).listen(port, callback)
}

var handlers = {
  canonicalHeader: function (res, link) {
    res.writeHead(200, {
      Link: '<' + link + '>; rel="canonical"'
    })
    res.end()
  },
  canonicalTag: function (res, link) {
    var body = '<html><head><link rel="canonical" href="' + link + '"></head><html>'
    res.writeHead(200)
    res.end(body)
  },
  redirect: function (res, link) {
    res.writeHead(301, {
      Location: link
    })
    res.end()
  },
  nothing: function (res) {
    res.writeHead(200)
    res.end()
  }
}
