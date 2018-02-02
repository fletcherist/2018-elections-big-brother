const mongoose = require('mongoose')
const User = mongoose.model('User')
const { PLATFORMS } = require('../constants')

/* Create user based on Telegram Platform */
async function createTelegramUser({
  first_name,
  last_name,
  username,
  id,
  isVerified,
  verificationToken
}) {
  if (!id) {
    throw new Error('Cant create telegram user')
  }

  if (await isUserExistByTelegramId(id)) {
    throw new Error(`User already exists, telegramId:${id}`)
  }

  const user = new User()
  user.platform = PLATFORMS.TELEGRAM
  user.isVerified = isVerified || false
  user.verificationToken = verificationToken || ''
  user.telegramId = id
  user.fullName = `${first_name || 'noFirstName'} ${last_name || 'noLastName'}`

  return await user.save()
}

async function findUserByTelegramId(telegramId) {
  const user = User.findOne({telegramId})
  if (!user) return null
  return user
}

async function isUserExistByTelegramId(telegramId) {
  const user = await findUserByTelegramId(telegramId)
  if (user) return true
  return false
}

async function updateTelegramUserLocation(telegramId, latitude, longitude) {
  if (!latitude || !longitude) return false
  const user = await findUserByTelegramId(telegramId)
  user.location = user.location || {}
  user.location.latitude = latitude
  user.location.longitude = longitude
  return await user.save()
}

module.exports.createTelegramUser = createTelegramUser
module.exports.isUserExistByTelegramId = isUserExistByTelegramId
module.exports.findUserByTelegramId = findUserByTelegramId
module.exports.updateTelegramUserLocation = updateTelegramUserLocation
