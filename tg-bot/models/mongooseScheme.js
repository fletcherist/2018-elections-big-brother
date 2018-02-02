const mongoose = require('mongoose')
const Schema = mongoose.Schema

const {
  PLATFORMS,
  ELECTORS_ATTENDANCE_TYPES
} = require('../constants')

const userSchema = new Schema({
  fullName: String,
  username: String,
  /*
   * User id represents unique identifier of the user
   * on the api-friendly platform
   */
  userId: String,
  /*
   * Platform represents api-friendly client
   * @see PLATFORMS
   */
  platform: {type: String, default: PLATFORMS.TELEGRAM},
  /*
   * Is user verified or not
   */
  isVerified: {type: Boolean, default: false},
  verificationToken: {type: String, default: ''},

  /*
   *
   */
  telegramId: String,

  location: {
    latitude: {type: Number, default: 0},
    longitude: {type: Number, default: 0}
  }
})

const electorsAttendanceSchema = new Schema({
  /*
   * time voter came
   */
  timestamp: {type: Date, default: Date.now},

  /*
   * @see ELECTORS_ATTENDANCE_TYPES
   */
  type: String,

  /*
   * Author user id
   */
  sourceUserId: String,

  /*
   * Geoposition of the even
   */
  location: {
    latitude: {type: Number, default: 0},
    longitude: {type: Number, default: 0}
  },

  /*
   * For blockchain
   */
  hash: String,
  previousHash: String
})

const globalStatisticsSchema = new Schema({
  electorsCount: {type: Number, default: 0},
  timestamp: {type: Date, default: Date.now}
})

mongoose.model('User', userSchema)
mongoose.model('ElectorsAttendance', electorsAttendanceSchema)
mongoose.model('GlobalStatistics', globalStatisticsSchema)
