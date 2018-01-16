const mongoose = require('mongoose')
const Schema = mongoose.Schema
const config = require('./config')

const connection = mongoose.connect(config.MONGODB_DATABASE_PATH, {
  useMongoClient: true
})
console.log(connection)

mongoose.Promise = Promise

const userSchema = new Schema({
  authenticationType: String,
  username: String
})

const User = mongoose.model('User', userSchema)

const user = new User()
user.username = 'test'
user.authenticationType = 'TELEGRAM'

user.save((err, doc) => console.log(doc))

