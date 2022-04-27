// 由于 Redis 的特殊性，它并没有库和表这个概念
// 所以 VS_DB_NAME 和 VS_DB_PAGE_PV 没能用上
const { VS_DB_URL, VS_DB_SITE_UV, VS_DB_SITE_PV } = process.env

let db

async function connectDatabase() {
  if (db) return db
  const Redis = require('ioredis')
  db = new Redis(VS_DB_URL)
}

module.exports = async (ip, path) => {
  await connectDatabase()

  const uv = VS_DB_SITE_UV || 'vs_site_uv'
  const pv = VS_DB_SITE_PV || 'vs_site_pv'

  await db.sadd(uv, ip)
  /* eslint-disable camelcase */
  return {
    site_uv: await db.scard(uv),
    site_pv: await db.incr(pv),
    page_pv: await db.incr(path)
  }
  /* eslint-enable */
}
