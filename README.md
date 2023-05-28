# Visit-Stat

- Lightweight
- Statistics `site_pv`, `site_uv`, `page_pv`, `page_uv`
- Storages `Deta`, `MongoDB`, `Redis`
- Support `ServerLess`

## Free Storage

- [Deta](https://deta.space)
- [MongoDB](https://mongodb.com)
- [Redis](https://upstash.com)

## Free Deploy

- [Deta](https://github.com/Lete114/Visit-Stat/tree/deta)
- [Vercel](https://github.com/Lete114/Visit-Stat/tree/vercel)

## Usage

> The following example uses the install dependency approach to deployment. You can just clone the repository and run `node start.js`.

```bash
mkdir visit-stat
cd visit-stat
npm install visit-stat
```

Create a new index.js

```js
// index.js
require('visit-stat').server()

// If is ServerLess
// module.exports = require('visit-stat').main
```

After successful deployment, you can send requests through the front-end browser to perform access statistics

> support `GET` and `POST` requests

```js
// The unique identification of the statistics is determined by the referer in the request header.
// If the referer is `https://example.com` then `{ "site_pv": 2, "site_uv": 1 }`will be returned
// If referer is `https://example.com/post/xxxx.html` then `{ "page_pv": 2, "page_uv": 1 }`
// Visits to the root of the site will return site statistics, and visits to sub-pages of the site will return page statistics

// referer: https://example.com
// You need to set referrerPolicy to get the web page referer correctly, if you don't set referrerPolicy, the referer you get will probably be the root of the website every time.
fetch('http://localhost:6870', { referrerPolicy: 'no-referrer-when-downgrade' })
  .then((r) => r.json())
  .then(console.log)
// => { "site_pv": 23, "site_uv": 1 }

// referer: https://example.com/post/xxxx.html
fetch('http://localhost:6870', { referrerPolicy: 'no-referrer-when-downgrade' })
  .then((r) => r.json())
  .then(console.log)
// => { "page_pv": 3, "page_uv": 1 }

// Bulk access to statistical information (Maximum 20 URLs, and the `domain` of these 20 URLs must be the same as the referer, otherwise they will be filtered)
fetch('http://localhost:4200/visits', {
  method: 'post',
  body: JSON.stringify({ urls: ['https://example.com', 'https://example.com/post/xxxx.html'] })
})
  .then((r) => r.json())
  .then(console.log)
// =>
//[
//  {
//    "url": "https://example.com",
//    "site_pv": 23,
//    "site_uv": 1
//  },
//  {
//    "url": "https://example.com/post/xxxx.html",
//    "page_pv": 3,
//    "page_uv": 1
//  }
// ]
```
