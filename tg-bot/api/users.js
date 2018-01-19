const mongoose = require('mongoose')
const User = mongoose.model('User')
const { PLATFORMS } = require('../constants')

/* Create user based on Telegram Platform */
async function createTelegramUser({
  first_name,
  last_name,
  username,
  id,
  isVerified
}) {
  if (!first_name || !last_name || !username || !id || !isVerified) {
    throw new Error('Cant create telegram user')
  }

  if (await isUserExistByTelegramId(id)) {
    throw new Error(`User already exists, telegramId:${id}`)
  }

  const user = new User()
  user.platform = PLATFORMS.TELEGRAM
  user.isVerified = isVerified || false
  user.telegramId = id
  user.fullName = `${first_name} ${last_name}`

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

module.exports.createTelegramUser = createTelegramUser
module.exports.isUserExistByTelegramId = isUserExistByTelegramId
module.exports.findUserByTelegramId = findUserByTelegramId
