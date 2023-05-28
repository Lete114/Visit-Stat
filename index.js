require('dotenv').config()
const server = require('./server')
const main = require('./main')
const adapter = require('./database/adapter')

module.exports = { server, main, database: adapter }
