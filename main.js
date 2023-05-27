/* eslint-disable camelcase */
const getUserIP = require('get-user-ip')
const bodyData = require('body-data')
const adapter = require('./database/adapter')
const { isUrlRegExp, refererHandler } = require('./utils')

/**
 *
 * @param { import('http').IncomingMessage } req
 * @param { import('http').ServerResponse } res
 * @returns
 */
// eslint-disable-next-line max-statements
module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate')
    res.setHeader('Content-Type', 'application/json;charset=utf-8')
    const db = await adapter()
    if (!db) {
      res.statusCode = 400
      res.end(JSON.stringify({ msg: 'No matching database found' }))
      return
    }
    const request_url = refererHandler(req.url)

    const data = await bodyData(req)
    const ip = getUserIP(req, ['headers.cf-connecting-ip'])
    // eslint-disable-next-line no-console
    console.log({ ip, ua: req.headers['user-agent'], data })

    const referer = req.headers.referer
    // eslint-disable-next-line no-console
    console.log('referer', referer)
    if (!isUrlRegExp.test(referer)) {
      res.statusCode = 400
      res.end(JSON.stringify({ msg: 'Missing Referer header' }))
      return
    }

    const { host } = new URL(referer)

    // Get statistics in bulk
    if (request_url === '/visits') {
      if (!data.urls) {
        res.statusCode = 400
        return res.end(JSON.stringify({ msg: 'Missing `urls` parameter' }))
      }
      const urls_raw = req.method === 'GET' ? data.urls.split(',') : data.urls

      // Limit access to 20 bars only
      const urls = urls_raw
        .filter((url) => isUrlRegExp.test(url) && new URL(url).host === host)
        .slice(0, 20)
        .map((url) => [[refererHandler(url)], url])

      const fromEntries = Object.fromEntries(urls)
      const entries = Object.entries(fromEntries)
      const result_visits = await db.visits(entries)
      res.statusCode = 200
      return res.end(JSON.stringify(result_visits))
    }

    const result_counter = await db.counter(ip, host, refererHandler(referer))

    // eslint-disable-next-line no-console
    console.log(result_counter)

    res.statusCode = 200
    res.end(JSON.stringify(result_counter))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    res.statusCode = 500
    res.end(JSON.stringify({ msg: 'Bad Request', github: 'https://github.com/Lete114/Visit-Stat' }))
  }
}
