const { VS_DB_URL } = process.env

let db

async function connectDatabase() {
  if (db) return db
  const Redis = require('ioredis')
  db = new Redis(VS_DB_URL)
}

module.exports = async (ip, referer) => {
  await connectDatabase()

  const uv = 'uv_' + referer
  // site pv
  const spv = 'spv_' + referer
  // page pv
  const ppv = 'ppv_' + referer

  await db.sadd(uv, ip)

  const result = await Promise.all([db.scard(uv), db.incr(spv), db.incr(ppv)])

  /* eslint-disable camelcase */
  return {
    site_uv: result[0],
    site_pv: result[1],
    page_pv: result[2]
  }
  /* eslint-enable */
}
