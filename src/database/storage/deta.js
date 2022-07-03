const { VS_DB_URL, DETA_PROJECT_KEY } = process.env

let db

async function connectDatabase() {
  if (db) return db
  const { Deta } = require('deta')
  const deta = Deta(DETA_PROJECT_KEY || VS_DB_URL)
  db = deta.Base('visit_statis')
}

module.exports = async (ip, referer) => {
  try {
    await connectDatabase()

    const get = (await db.get(referer)) || {
      spv: 0, // sitePV
      ppv: 0, // pagePV
      uv: []
    }
    const result = await db.put(get, referer)
    const update = {}

    result.uv.push(ip)
    update.uv = [...new Set(result.uv)]
    update.spv = db.util.increment()
    update.ppv = db.util.increment()

    await db.update(update, referer)

    /* eslint-disable camelcase */
    return {
      site_uv: update.uv.length,
      site_pv: result.spv + 1,
      page_pv: result.ppv + 1
    }
    /* eslint-enable */
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
}
