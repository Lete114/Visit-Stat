const { VS_DB_URL } = process.env

let db

async function connectDatabase() {
  if (db) return db

  const { MongoClient } = require('mongodb')
  const options = { useNewUrlParser: true, useUnifiedTopology: true }
  const client = await MongoClient.connect(VS_DB_URL, options)

  const dbName = new URL(VS_DB_URL).pathname.substring(1) || 'visit_statis'
  db = await client.db(dbName)
}

module.exports = async (ip, referer) => {
  await connectDatabase()
  const siteUV = 'vs_site_uv'
  const sitePV = 'vs_site_pv'
  const pagePV = 'vs_page_pv'
  const query = { referer }
  const upsert = { upsert: true }
  const siteUVOpt = { $addToSet: { uv: ip } }
  const PVOpt = { $inc: { counter: 1 } }

  await Promise.all([
    db.collection(siteUV).findOneAndUpdate(query, siteUVOpt, upsert),
    db.collection(sitePV).findOneAndUpdate(query, PVOpt, upsert),
    db.collection(pagePV).findOneAndUpdate(query, PVOpt, upsert)
  ])

  const result = await Promise.all([
    db.collection(siteUV).findOne(query),
    db.collection(sitePV).findOne(query),
    db.collection(pagePV).findOne(query)
  ])

  /* eslint-disable camelcase */
  return {
    site_uv: result[0].uv.length,
    site_pv: result[1].counter,
    page_pv: result[2].counter
  }
  /* eslint-enable */
}
