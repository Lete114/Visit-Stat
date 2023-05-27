/* eslint-disable camelcase */
const { VS_DB_URL } = process.env

const collection = 'visit_stat'
/**
 * @type { import('mongodb').Db }
 */
let db

async function connectDatabase() {
  if (db) return db

  const { MongoClient } = require('mongodb')
  const options = { useNewUrlParser: true, useUnifiedTopology: true }
  const client = await MongoClient.connect(VS_DB_URL, options)

  const dbName = new URL(VS_DB_URL).pathname.substring(1) || 'visit_statis'
  db = await client.db(dbName)
}
module.exports = async () => {
  await connectDatabase()

  return {
    /**
     * get visits
     * @param { [string, any][] } urlEntries
     * @returns { {url?: string; site_pv?: number; site_uv?: number; page_pv?: number; page_uv?: number; } }
     */
    async visits(urlEntries) {
      const fromEntries = Object.fromEntries(urlEntries)
      const query = { id: { $in: urlEntries.map(([url]) => url) } }
      const result = await db.collection(collection).find(query).toArray()
      const visits = result.map((item) => {
        const obj = { url: fromEntries[item.id] }
        if (item['site_pv']) obj.site_pv = item['site_pv']
        if (item['site_uv']) obj.site_uv = item['site_uv'].length

        if (item['page_pv']) obj.page_pv = item['page_pv']
        if (item['page_uv']) obj.page_uv = item['page_uv'].length
        return obj
      })
      return visits
    },

    /**
     * get counter
     * @param { string } ip
     * @param { string } host
     * @param { string } referer
     * @returns { {site_pv: number; site_uv: number; page_pv?: number; page_uv?: number; } }
     */
    async counter(ip, host, referer) {
      const upsert = { upsert: true }
      const options = { $inc: { site_pv: 1 }, $addToSet: { site_uv: ip } }

      const PromiseAllUpdate = [db.collection(collection).findOneAndUpdate({ id: host }, options, upsert)]
      const PromiseAllFind = []

      if (host !== referer) {
        const options = { $inc: { page_pv: 1 }, $addToSet: { page_uv: ip } }
        PromiseAllUpdate.push(db.collection(collection).findOneAndUpdate({ id: referer }, options, upsert))
        PromiseAllFind[1] = db.collection(collection).findOne({ id: referer })
      }
      await Promise.all(PromiseAllUpdate)

      PromiseAllFind[0] = db.collection(collection).findOne({ id: host })
      const [host_result, referer_result] = await Promise.all(PromiseAllFind)
      const obj = {
        site_pv: host_result.site_pv,
        site_uv: host_result.site_uv.length
      }
      if (referer_result) {
        obj.page_pv = referer_result.page_pv
        obj.page_uv = referer_result.page_uv.length
      }
      return obj
    }
  }
}
