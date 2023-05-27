const http = require('http')
const main = require('./main')

const PORT = process.env.PORT || 6870

module.exports = () => http.createServer(main).listen(PORT)
