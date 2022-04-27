const { VS_DB_URL, VS_DB_NAME, VS_DB_SITE_UV, VS_DB_SITE_PV, VS_DB_PAGE_PV } =
  process.env

let db

async function connectDatabase() {
  if (db) return db

  const { MongoClient } = require('mongodb')
  const options = { useNewUrlParser: true, useUnifiedTopology: true }
  const client = await MongoClient.connect(VS_DB_URL, options)

  const dbName = VS_DB_NAME || new URL(VS_DB_URL).pathname.substring(1)
  db = await client.db(dbName || 'visit_statis')
}

module.exports = async (ip, path) => {
  await connectDatabase()
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
