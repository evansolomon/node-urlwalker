var url = require('url')

var async = require('async')
var cheerio = require('cheerio')
var request = require('request')
var parseLinkHeader = require('parse-link-header')

exports.walk = function (optsOrUrl, callback) {
  var opts
  if (typeof optsOrUrl === 'string') {
    opts = {url: optsOrUrl}
  } else {
    opts = optsOrUrl
  }

  var stack = new RedirectStack(opts.url)
  var cookieJar = request.jar()

  async.until(function () {
    return stack.isFinished()
  }, function (done) {
    exports.findNext(stack.last().url, cookieJar, function (err, result) {
      if (err) return done(err)

      stack.setSuccess(stack.length - 1, result.success)

      // The success status for the last item is intentionally never set because it should
      // match the previous item since they're the same URL
      stack.push(result.nextUrl)
      done()
    })
  }, function (err) {
    if (err) return callback(err)

    var predicate
    if (opts.validate) {
      predicate = function (item) {
        return !! item.success
      }
    } else {
      predicate = function () {
        return true
      }
    }

    var lastValidated = stack.lastWhere(predicate)
    var lastValidatedUrl = lastValidated ? lastValidated.url : null
    callback(null, lastValidatedUrl)
  })
}

exports.findNext = function (originalUrl, cookieJar, callback) {
  // request will automatically follow redirects
  request({
    jar: cookieJar,
    url: originalUrl,
    headers: {
      'user-agent': 'Node URL Walker'
    }
  }, function (err, res, body) {
    if (err) return callback(err)

    // Final URI that the request module got
    // By default, this is the url result
    var redirectedUri = res.request.uri.href

    var result = {
      success: res.statusCode < 400,
      nextUrl: redirectedUri
    }

    var canonical = exports.getCanonicalUrl(res, body)
    if (canonical) {
      result.nextUrl = url.resolve(result.nextUrl, canonical)
    }

    return callback(null, result)
  })
}

exports.getCanonicalUrl = function (response, html) {
  var $
  var canonical

  try {
    $ = cheerio.load(html)
    canonical = $('link[rel="canonical"]')
  } catch (err) {
    console.error('Error loading body content in cheerio')
    console.error(err)
  }

  if (canonical && canonical.length) {
    return canonical.attr('href')
  } else if (response.headers.link) {
    var linkHeader = parseLinkHeader(response.headers.link)
    if (linkHeader.canonical) {
      return linkHeader.canonical.url
    }
  }
}


function RedirectStack(initialUrl) {
  this._stack = []
  this.length = 0
  this.push(initialUrl)
}

RedirectStack.prototype.push = function (url) {
  this.length = this._stack.push({url: url})
}

RedirectStack.prototype.setSuccess = function (index, success) {
  this.at(index).success = success
}

RedirectStack.prototype.isFinished = function () {
  return this.length >= 2 && this.last().url === this.at(this.length - 2).url
}

RedirectStack.prototype.at = function (index) {
  return this._stack[index]
}

RedirectStack.prototype.last = function () {
  return this.at(this.length - 1)
}

RedirectStack.prototype.lastWhere = function (predicate) {
  var item
  var i = this.length - 1
  while (i >= 0) {
    item = this.at(i)
    if (predicate(item)) {
      return item
    }

    i--
  }
}
