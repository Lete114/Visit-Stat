require('output-line')()
const GetUserIP = require('get-user-ip')
const bodyData = require('body-data')

const {
  VS_DOMAIN,
  VS_DB_MONGODB,
  VS_DB_NAME,
  VS_DB_SITE_UV,
  VS_DB_SITE_PV,
  VS_DB_PAGE_PV
} = process.env

let db

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

    // 连接数据库
    await connectDatabase()

    // 域名白名单
    const cors = (VS_DOMAIN || '').split(',').includes(url.host)
    if (VS_DOMAIN && !cors) {
      res.statusCode = 403
      return res.end()
    }

    // 解析 index.html 和 / 结尾的路径
    const path = indexHandler(url.pathname)

    // 统计处理
    const counter = await counterHandler(ip, path)

    // 响应 jsonp 回调函数
    res.end(`${fn}(${JSON.stringify(counter)})`)
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.error(error)
    res.end(JSON.stringify({ msg: 'Bad Request' }))
  }
}
/* eslint-enable */

async function connectDatabase() {
  if (!VS_DB_MONGODB) throw new Error('未设置环境变量 "VS_DB_MONGODB"')
  if (db) return db

  const { MongoClient } = require('mongodb')
  const options = { useNewUrlParser: true, useUnifiedTopology: true }
  const client = await MongoClient.connect(VS_DB_MONGODB, options)

  const dbName = VS_DB_NAME || new URL(VS_DB_MONGODB).pathname.substring(1)
  db = await client.db(dbName || 'visit_statis')
}

function indexHandler(params) {
  let path = params.replace(/(\/index\.html|\/)*$/gi, '')
  if (path.length === 0) path += '/'
  return path
}

async function counterHandler(ip, path) {
  const siteUV = VS_DB_SITE_UV || 'vs_site_uv'
  const sitePV = VS_DB_SITE_PV || 'vs_site_pv'
  const pagePV = VS_DB_PAGE_PV || 'vs_page_pv'
  const upsert = { upsert: true }

  const siteUVOpt = { $setOnInsert: { ip } }
  const sitePVOpt = { $inc: { counter: 1 }, $setOnInsert: {} }
  const pagePVOpt = { $inc: { counter: 1 }, $setOnInsert: { path } }

  await db.collection(siteUV).findOneAndUpdate({ ip }, siteUVOpt, upsert)
  await db.collection(sitePV).findOneAndUpdate({}, sitePVOpt, upsert)
  await db.collection(pagePV).findOneAndUpdate({ path }, pagePVOpt, upsert)

  /* eslint-disable camelcase */
  return {
    site_uv: await db.collection(siteUV).countDocuments(),
    site_pv: (await db.collection(sitePV).findOne({})).counter,
    page_pv: (await db.collection(pagePV).findOne({ path })).counter
  }
  /* eslint-enable */
}
