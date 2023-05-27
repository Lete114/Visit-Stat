/* eslint-disable max-len */
const { VS_DB_URL, DETA_PROJECT_KEY } = process.env

/**
 * @typedef { {site_pv: number; site_uv: number; page_pv?: number; page_uv?: number; } } counterType
 */

/**
 * @typedef { {url?: string; site_pv?: number; site_uv?: number; page_pv?: number; page_uv?: number;} } visitsType
 */

/**
 * @typedef {{visits(urls: [string, any][]):Promise<visitsType>; counter(ip: string, host_md5: string, referer_md5: string): Promise<counterType>;}} adapterType
 */

/**
 * adapter database
 * @returns { adapterType | null | undefined }
 */
module.exports = async () => {
  try {
    // is deta space
    if (DETA_PROJECT_KEY) return await require('./storages/deta')()

    // eslint-disable-next-line no-console
    if (!VS_DB_URL) return console.log('No environment variables set "VS_DB_URL"')

    // is mongodb
    if (VS_DB_URL.startsWith('mongodb')) return await require('./storages/mongodb')()
    // is redis
    if (VS_DB_URL.startsWith('redis')) return await require('./storages/redis')()
  } catch (error) {
    /* eslint-disable no-console */
    console.error('Database connect fault')
    console.error(error)
    /* eslint-enable */
  }
}
