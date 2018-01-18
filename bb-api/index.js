const mongoose = require('mongoose')
const Schema = mongoose.Schema
const config = require('./config')

const models = require('./models')

/*
 * Setting up the connection
 */
mongoose.Promise = Promise
const connection = mongoose.connect(config.MONGODB_DATABASE_PATH, {
  useMongoClient: true
})
console.log(connection)

