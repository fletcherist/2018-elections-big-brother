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
  /*
   * GeoJSON Implementation
   */
  location: {
    type: {type: String},
    coordinates: {
      type: [Number]
    }
  },
  pollingStationId: {type: String},
  room: String
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
   * GeoJSON Implementation
   */
  location: {
    type: {type: String},
    coordinates: {
      type: [Number]
    }
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

const pollingStationSchema = new Schema({
  name: {type: String, default: ''},
  location: {
    type: {type: String},
    coordinates: {
      type: [Number]
    }
  },
  city: {type: String, default: ''}
})

pollingStationSchema.index({ location: '2dsphere' })
userSchema.index({ location: '2dsphere' })
electorsAttendanceSchema.index({ location: '2dsphere' })

mongoose.model('User', userSchema)
mongoose.model('ElectorsAttendance', electorsAttendanceSchema)
mongoose.model('GlobalStatistics', globalStatisticsSchema)
mongoose.model('PollingStation', pollingStationSchema)
