const http = require('http')
const main = require('./main')

const PORT = process.env.VS_PORT || process.env.PORT || 6870

module.exports = () => {
  const server = http.createServer(main)
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log('Service is up and running port: ' + PORT)
  })
}
