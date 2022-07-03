// 解析 index.html 和 / 结尾的路径
function indexHandler(params) {
  let path = params.replace(/(\/index\.html|\/)*$/gi, '')
  if (path.length === 0) path += '/'
  return path
}

const { VS_DB_TYPE, VS_DB_URL } = process.env

module.exports = async (ip, referer) => {
  try {
    if (!VS_DB_URL) throw new Error('No environment variables set "VS_DB_URL"')
    referer = indexHandler(referer).replace(/^https?:\/\//, '')
    const db = (VS_DB_TYPE || '').toLowerCase()

    if (['mongodb', 'redis', 'deta'].includes(db)) {
      return await require('./storage/' + db)(ip, referer)
    }
    throw new Error('No matching database found')
  } catch (error) {
    /* eslint-disable no-console */
    console.error('Database connect fault')
    console.error(error)
    /* eslint-enable */
  }
}
