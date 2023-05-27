const crypto = require('node:crypto')

const isUrlRegExp = /^https?:\/\//

function md5(data, length) {
  return crypto
    .createHash('md5')
    .update(data)
    .digest('hex')
    .slice(0, length || 16)
}
/**
 * @param { string } url
 * @returns
 */
function refererHandler(url) {
  return url
    .replace(isUrlRegExp, '')
    .replace(/#.*$/, '')
    .replace(/\?.*$/, '')
    .replace(/(\/index\.html|\/)*$/gi, '')
}


module.exports = {
  isUrlRegExp,
  md5,
  refererHandler
}
