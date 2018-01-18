const fetch = require('node-fetch')
const TelegramBot = require('node-telegram-bot-api')

const {
  TELEGRAM_API_KEY,
  FIREBASE_DATABASE_URL,
} = require('./config')

const firebaseAdmin = require('firebase-admin')

// Setup firebase database & application
const firebase = {}
firebase.app = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(require('./etc/firebase-keys.json')),
  databaseURL: FIREBASE_DATABASE_URL
})

firebase.db = firebase.app.database()



const bot = new TelegramBot(TELEGRAM_API_KEY, {polling: true})

bot.on('message', event => {
  const telegramId = event.chat.id
  

  bot.sendMessage(telegramId)
})
