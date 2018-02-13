const mongoose = require('mongoose')
const User = mongoose.model('User')
const { PLATFORMS } = require('../constants')
const {
  createPollingStation,
  findNearestPollingStation
} = require('./pollingStations')
const { connectTokenWithUser } = require('./verificationTokens')

/* Create user based on Telegram Platform */
async function createTelegramUser({
  first_name,
  last_name,
  username,
  id
}) {
  if (!id) {
    throw new Error('Cant create telegram user')
  }

  if (await isUserExistByTelegramId(id)) {
    throw new Error(`User already exists, telegramId:${id}`)
  }

  const user = new User()
  user.platform = PLATFORMS.TELEGRAM
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

async function attachTelegramUserPollingStation(telegramId) {
  const user = await findUserByTelegramId(telegramId)
  if (!user) return false
  const { coordinates } = user.location
  if (!coordinates) {
    console.log('User has no coordinates')
    return false
  }
  // Attach to already existed one
  const nearestPollingStation = await findNearestPollingStation(coordinates[0], coordinates[1])
  if (nearestPollingStation) {
    user.pollingStationId = nearestPollingStation.id
    await user.save()
    return user.pollingStationId
  }
  // Create new
  const newPollingStation = await createPollingStation({
    latitude: coordinates[0],
    longitude: coordinates[1]
  })

  user.pollingStationId = newPollingStation.id
  await user.save()
  return user.pollingStationId
}

async function updateTelegramUserLocation(telegramId, latitude, longitude) {
  if (!latitude || !longitude) return false
  const user = await findUserByTelegramId(telegramId)
  if (!user) {
    return false
  }
  user.location = user.location || {}
  user.location.type = 'Point'
  user.location.coordinates = [latitude, longitude]
  user.isLocationSet = true
  return await user.save()
}

async function verifyTelegramUser(verificationToken, telegramId) {
  try {
    const user = await findUserByTelegramId(telegramId)
    if (!user) return false
    await connectTokenWithUser(verificationToken, telegramId)
    user.isVerified = true
    user.verificationToken = verificationToken
    await user.save()
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

module.exports.createTelegramUser = createTelegramUser
module.exports.isUserExistByTelegramId = isUserExistByTelegramId
module.exports.findUserByTelegramId = findUserByTelegramId
module.exports.updateTelegramUserLocation = updateTelegramUserLocation
module.exports.attachTelegramUserPollingStation = attachTelegramUserPollingStation
module.exports.verifyTelegramUser = verifyTelegramUser
