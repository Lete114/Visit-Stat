// 解析 index.html 和 / 结尾的路径
function indexHandler(params) {
  let path = params.replace(/(\/index\.html|\/)*$/gi, '')
  if (path.length === 0) path += '/'
  return path
}

const { VS_DB_TYPE, VS_DB_URL } = process.env

module.exports = async (ip, path) => {
  try {
    if (!VS_DB_URL) throw new Error('No environment variables set "VS_DB_URL"')
    path = indexHandler(path)
    const db = (VS_DB_TYPE || '').toUpperCase()

    switch (db) {
      case 'MONGODB':
        return await require('./storage/mongodb')(ip, path)
      case 'REDIS':
        return await require('./storage/redis')(ip, path)
      default:
        throw new Error('No matching database found')
    }
  } catch (error) {
    /* eslint-disable no-console */
    console.error('Database connect fault')
    console.error(error)
    /* eslint-enable */
  }
}
