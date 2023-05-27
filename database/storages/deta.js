/* eslint-disable camelcase */
const { Deta } = require('deta')

module.exports = async () => {
  const deta = Deta()
  const db = deta.Base('visit_stat')

  return {
    /**
     * get visits
     * @param { [string, any][] } urlEntries
     * @returns { {url?: string; site_pv?: number; site_uv?: number; page_pv?: number; page_uv?: number; } }
     */
    async visits(urlEntries) {
      const fromEntries = Object.fromEntries(urlEntries)
      const result = await db.fetch(urlEntries.map(([url]) => ({ id: url })))
      const visits = result.items.map((item) => {
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
    // eslint-disable-next-line max-statements
    async counter(ip, host, referer) {
      const result = {}
      const fetch_result = await db.fetch({ id: host })
      const site = fetch_result.count ? fetch_result.items[0] : { id: host, site_pv: 0, site_uv: [] }
      site.site_pv++
      site.site_uv.push(ip)
      site.site_uv = [...new Set(site.site_uv)]

      if (host !== referer) {
        const fetch_result = await db.fetch({ id: referer })
        const page = fetch_result.count ? fetch_result.items[0] : { id: referer, page_pv: 0, page_uv: [] }
        page.page_pv++
        page.page_uv.push(ip)
        page.page_uv = [...new Set(page.page_uv)]
        const page_result = await db.put(page)
        result.page_pv = page_result.page_pv
        result.page_uv = page_result.page_uv.length
      }
      const site_reslut = await db.put(site)
      result.site_pv = site_reslut.site_pv
      result.site_uv = site_reslut.site_uv.length
      return result
    }
  }
}
