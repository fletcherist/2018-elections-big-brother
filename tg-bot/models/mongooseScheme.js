const mongoose = require('mongoose')
const Schema = mongoose.Schema

const {
  PLATFORMS
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
    type: {type: String, default: 'Point'},
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  isLocationSet: {type: Boolean, default: false},
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

  pollingStationId: {type: String},

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
  city: {type: String, default: ''},
  electorsCount: {type: Number, default: 0},
  formattedAdress: {type: String},
  zipcode: {type: String},
  sourceCityId: {type: String}
})

const verificationTokenSchema = new Schema({
  token: String,
  isUsed: {type: Boolean, default: false},
  connectedUserId: {type: String}
})

const citySchema = new Schema({
  name: String,
  electorsCount: {type: Number, default: 0},
  location: {
    type: {type: String},
    coordinates: {
      type: [Number]
    }
  }
})

const reportSchema = new Schema({
  type: {type: String},
  imageUrl: {type: String},
  fromUserId: {type: String},
  comment: {type: String},
  pollingStationId: {type: String},
  timestamp: {type: Date, default: Date.now}
})

pollingStationSchema.index({ location: '2dsphere' })
userSchema.index({ location: '2dsphere' })
electorsAttendanceSchema.index({ location: '2dsphere' })
citySchema.index({ location: '2dsphere' })

mongoose.model('User', userSchema)
mongoose.model('ElectorsAttendance', electorsAttendanceSchema)
mongoose.model('GlobalStatistics', globalStatisticsSchema)
mongoose.model('PollingStation', pollingStationSchema)
mongoose.model('VerificationToken', verificationTokenSchema)
mongoose.model('City', citySchema)
mongoose.model('Report', reportSchema)
