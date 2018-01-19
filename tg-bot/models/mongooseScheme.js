const mongoose = require('mongoose')
const Schema = mongoose.Schema

const {
  PLATFORMS,
  REALTIME_VOTERS_TYPE
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

  /*
   *
   */
  telegramId: String
})

const votersTrackingSchema = new Schema({
  /*
   * time voter came
   */
  timestamp: {type: Date, default: Date.now},

  /*
   * @see REALTIME_VOTERS_TYPE
   */
  type: String,

  /*
   * Geoposition of the even
   */
  location: {
    
  },

  /*
   * For blockchain
   */
  hash: String,
  previousHash: String
})

mongoose.model('User', userSchema)
mongoose.model('VotersTracking', votersTrackingSchema)
