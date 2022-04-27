require('output-line')()
const GetUserIP = require('get-user-ip')
const bodyData = require('body-data')

const counterHandler = require('./database/index')

const { VS_DOMAIN } = process.env

/* eslint-disable max-statements */
module.exports = async (req, res) => {
  try {
    // 解析 referer
    const referer = req.headers.referer
    if (!/^https?:\/\/\w+/.test(referer)) throw new Error('Referer error')
    const url = new URL(referer)

    // 获取用户 IP
    const ip = GetUserIP(req)

    // 获取 jsonp 回调方法
    const data = await bodyData(req)
    const fn = Object.values(data)[0]
    if (!fn) throw new Error('Not found callback')

    // 域名白名单
    const cors = (VS_DOMAIN || '').split(',').includes(url.host)
    if (VS_DOMAIN && !cors) {
      res.statusCode = 403
      return res.end()
    }

    // 统计处理
    const counter = await counterHandler(ip, url.pathname)

    // eslint-disable-next-line no-console
    console.log({ ip, ...counter, ua: req.headers['user-agent'] })

    // 响应 jsonp 回调函数
    res.end(`${fn}(${JSON.stringify(counter)})`)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    res.end(JSON.stringify({ msg: 'Bad Request' }))
  }
}
/* eslint-enable */
