# urlwalker

Traverse URL redirects and `rel="canonical"`'s until you hit the end of the line.

### Example

```js
var urlwalker = require('urlwalker')

var originalUrl = 'https://medium.com/p/3689f413af27?nonsense=something'
urlwalker.walk(originalUrl, function (err, finalUrl) {
  console.log(finalUrl)
  // https://medium.com/@evansolomon/siri-focus-my-attention-3689f413af27
})
```

You can optionally validate that the final URL actually works (does not return >=400 status). The `validate` parameter defaults to `false`.

```js
// At the time of writing this, NYT generates a broken canonical URL, which should just be this
// URL but without the query params
var originalUrl = 'http://www.nytimes.com/roomfordebate/2015/05/08/can-the-us-make-peace-with-netanyahus-new-government?a=b'

urlwalker.walk({
  url: originalUrl,
  validate: true
}, function (err, finalUrl) {
  console.log('Validated:', finalUrl)
  // Validated: http://www.nytimes.com/roomfordebate/2015/05/08/can-the-us-make-peace-with-netanyahus-new-government?a=b
})


urlwalker.walk({
  url: originalUrl,
  validate: false
}, function (err, finalUrl) {
  console.log('Unvalidated:', finalUrl)
  // Unvalidated: http://www.nytimes.com/roomfordebate/2015/05/08/2015/05/08/can-the-us-make-peace-with-netanyahus-new-government

  // Notice that this URL is broken
})
```
