const Telegraf = require('telegraf')
const RedisSession = require('telegraf-session-redis')
const mongoose = require('mongoose')
require('./models/mongooseScheme')

const config = require('./config')

const api = require('./api')

const bot = new Telegraf(config.TELEGRAM_API_KEY)

const {
  PLATFORMS,
  REALTIME_VOTERS_TYPE,
  ACTION_TYPES
} = require('./constants')

console.log(api)

api.users.findUserByTelegramId(32149807)
  .then(console.log)

/*
 * Setting up MongoDB connection
 */
mongoose.Promise = Promise
const connection = mongoose.connect(config.MONGODB_DATABASE_PATH, {
  // useMongoClient: true
})

/*
 * Setting up RedisDB connection
 */
const redisSession = new RedisSession({
  store: {
    url: config.REDIS_SESSION_URL
  }
})
bot.use(redisSession.middleware())

function incrementCounter(ctx) {
  ctx.session.counter = ctx.session.counter || 0
  ctx.session.counter++
}

bot.command('start', async (ctx) => {
  const userInfo = ctx.from
  console.log(ctx)
  /* check whether session exists */
  if (ctx.session && ctx.session.status) {
    /* user is already signed up */

    return ctx.reply('registered user')
  }

  /*
    check if user exists in mongodb
  */
  if (await api.users.isUserExistByTelegramId(userInfo.id)) {
    /* exists, */
    return ctx.reply('already registered')
  }

  /*
    user is not signed up yet.
    make a registration
  */
  console.log(userInfo)
  await api.users.createTelegramUser({
    id: userInfo.id,
    first_name: userInfo.first_name,
    last_name: userInfo.last_name,
    username: userInfo.username,
    isVerified: true /* @TODO: make verification function */
  })

  return ctx.reply('registration successfull')
})

bot.hears(ACTION_TYPES.LOCATION_RECEIVED, (ctx) => {
  ctx.reply('Спасибо! Замечательно')
})

bot.on('message', (ctx) => {
  incrementCounter(ctx)

  if (ctx.message.location) {
    ctx.session.location = ctx.session.location || {}
    ctx.session.location = ctx.message.location
  }
  console.log(ctx.session.location)

  ctx.reply(`hello world! ${ctx.session.counter}`, {
    parse_mode: 'markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '+5 человек',
            callback_data: ACTION_TYPES.ACTION_TYPE_5_PEOPLE
          },
          {
            text: '+10 человек',
            callback_data: ACTION_TYPES.ACTION_TYPE_10_PEOPLE
          },
          {
            text: 'Отправить геопозицию',
            callback_data: ACTION_TYPES.SEND_REQUEST_LOCATION
          }
        ]
      ]
    },
  })
})

bot.action(ACTION_TYPES.ACTION_TYPE_5_PEOPLE, (ctx) => {
  console.log('5 people')
})

bot.action(ACTION_TYPES.ACTION_TYPE_10_PEOPLE, (ctx) => {
  console.log('10 people')
})

bot.action(ACTION_TYPES.SEND_REQUEST_LOCATION, (ctx) => {
  ctx.reply('Пожалуйста, отправьте нам своё местоположение, чтобы мы могли понять, на каком вы сейчас участке.', {
    reply_markup: {
      keyboard: [
        [{
          text: 'Отправить местоположение',
          request_location: true
        }]
      ]
    }
  })
})

bot.on('callback_query', (ctx) => {
  console.log(ctx)
  ctx.answerCbQuery('Засчитано')
})

bot.startPolling()