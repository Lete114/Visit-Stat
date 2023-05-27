/* eslint-disable camelcase */
const { VS_DB_URL } = process.env

/**
 * @type { import('ioredis').default }
 */
let db

async function connectDatabase() {
  if (db) return db
  const Redis = require('ioredis')
  db = new Redis(VS_DB_URL)
}
const mergedData = (data) =>
  data.reduce((acc, curr) => {
    const existingEntry = acc.find((item) => item.url === curr.url)
    if (existingEntry) {
      Object.assign(existingEntry, curr)
    } else {
      acc.push(curr)
    }
    return acc
  }, [])

/**
 * @param { array } result
 * @param { array } array
 * @param { string } prefix
 * @returns
 */
const getKeyValue = (result, array, prefix) =>
  result.map((value, i) => {
    if (value) {
      const url_key = array[i]
      const url = url_key.replace(prefix, '')
      const value_key = url_key.replace(prefix, '$1').replace(url, '')
      return {
        url,
        [value_key]: +value
      }
    }
  })
module.exports = async () => {
  await connectDatabase()

  return {
    /**
     * get visits
     * @param { [string, any][] } urlEntries
     * @returns { {url?: string; site_pv?: number; site_uv?: number; page_pv?: number; page_uv?: number; } }
     */
    async visits(urlEntries) {
      const keys = urlEntries.map(([url, url_raw]) =>
        new URL(url_raw).pathname === '/' ? ['site_pv_' + url, 'site_uv_' + url] : ['page_pv_' + url, 'page_uv_' + url]
      )
      const keysFlat = keys.flat()
      const site_pv = keysFlat.filter((item) => item.startsWith('site_pv_'))
      const site_uv = keysFlat.filter((item) => item.startsWith('site_uv_'))
      const page_pv = keysFlat.filter((item) => item.startsWith('page_pv_'))
      const page_uv = keysFlat.filter((item) => item.startsWith('page_uv_'))

      const [site_pv_result, site_uv_result, page_pv_result, page_uv_result] = await Promise.all([
        Promise.all(site_pv.map((key) => db.get(key))),
        Promise.all(site_uv.map((key) => db.scard(key))),
        Promise.all(page_pv.map((key) => db.get(key))),
        Promise.all(page_uv.map((key) => db.scard(key)))
      ])

      const keysValues = mergedData(
        [
          getKeyValue(site_pv_result, site_pv, /(site_pv)_/),
          getKeyValue(site_uv_result, site_uv, /(site_uv)_/),
          getKeyValue(page_pv_result, page_pv, /(page_pv)_/),
          getKeyValue(page_uv_result, page_uv, /(page_uv)_/)
        ]
          .flat()
          .filter(Boolean)
      )

      return keysValues
    },
    /**
     * get counter
     * @param { string } ip
     * @param { string } host
     * @param { string } referer
     * @returns { {site_pv: number; site_uv: number; page_pv?: number; page_uv?: number; } }
     */
    async counter(ip, host, referer) {
      const site_pv = 'site_pv_' + host
      const site_uv = 'site_uv_' + host
      const page_pv = 'page_pv_' + referer
      const page_uv = 'page_uv_' + referer
      const storage = [db.incr(site_pv), db.sadd(site_uv, ip)]

      if (host !== referer) {
        storage.push(db.incr(page_pv), db.sadd(page_uv, ip))
      }
      await Promise.all(storage)
      const getStorage = [db.get(site_pv), db.scard(site_uv), db.get(page_pv), db.scard(page_uv)]
      const [get_site_pv, get_site_uv, get_page_pv, get_page_uv] = await Promise.all(getStorage)

      const result = {
        site_pv: +get_site_pv,
        site_uv: get_site_uv
      }
      if (get_page_pv && get_page_uv) {
        result.page_pv = +get_page_pv
        result.page_uv = get_page_uv
      }
      return result
    }
  }
}
