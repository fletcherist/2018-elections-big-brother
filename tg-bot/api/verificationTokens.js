const mongoose = require('mongoose')
const VerificationToken = mongoose.model('VerificationToken')
const generateToken = require('nanoid/generate')

/*
 example:
 http://t.me/elections_2018bot?start=1671d43c8c91944f603f
*/
const TELEGRAM_BOT_URL = 'http://t.me/elections_2018bot'
const generateAuthenticationLink = token => `${TELEGRAM_BOT_URL}?start=${token}`

async function generateVerificationToken() {
  const verificationToken = new VerificationToken({
    token: generateToken('1234567890abcdef', 20),
    isUsed: false
  })

  await verificationToken.save()
  console.log('verification token has been created')
}

async function connectTokenWithUser(token, userId) {
  const verificationToken = await VerificationToken.findOne({token: token})
  if (!verificationToken) {
    throw new Error('Verification token does not exist')
  }
  if (verificationToken.isUsed === true) {
    throw new Error('This verification token has been already used')
  }

  verificationToken.connectedUserId = userId
  verificationToken.isUsed = true

  return await verificationToken.save()
}

module.exports.generateVerificationToken = generateVerificationToken
module.exports.connectTokenWithUser = connectTokenWithUser
