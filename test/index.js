var assert = require('assert')
var urlwalker = require('../')
var server = require('./server')
var PORT = 5000

describe('URL Walker', function () {
  before(function (done) {
    server.listen(5000, done)
  })

  // after(function () {

  // })

  it('Should get the original URL by default', function (done) {
    urlwalker.walk('http://localhost:5000/nothing', function (err, result) {
      assert.equal(result, 'http://localhost:5000/nothing')
      done()
    })
  })

  it('Should follow redirects', function (done) {
    urlwalker.walk('http://localhost:5000/redirect', function (err, result) {
      assert.equal(result, 'http://localhost:5000/nothing')
      done()
    })
  })

  it('Should follow rel=canonical headers', function (done) {
    urlwalker.walk('http://localhost:5000/canonicalHeader', function (err, result) {
      assert.equal(result, 'http://localhost:5000/nothing')
      done()
    })
  })

  it('Should follow rel=canonical tags', function (done) {
    urlwalker.walk('http://localhost:5000/canonicalTag', function (err, result) {
      assert.equal(result, 'http://localhost:5000/nothing')
      done()
    })
  })
})
