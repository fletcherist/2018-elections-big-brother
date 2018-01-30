const Telegraf = require('telegraf')
const RedisSession = require('telegraf-session-redis')
const mongoose = require('mongoose')
/* Initializing mongoose schemes */
require('./models/mongooseScheme')

const config = require('./config')
const api = require('./api')
const bot = new Telegraf(config.TELEGRAM_API_KEY)

function getTime() {
  var dateWithouthSecond = new Date()
  return dateWithouthSecond.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
}

const {
  PLATFORMS,
  REALTIME_VOTERS_TYPE,
  ACTION_TYPES
} = require('./constants')

console.log(api)

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

function setLatestMessageID(ctx) {
  ctx.session.latestMessageId = ctx.message.message_id
}

const app = {
  MAIN_KEYBOARD: [
    [
      {
        text: '➕ 1 человек 👤',
        callback_data: ACTION_TYPES.REQUEST_UPDATE
      }
    ],
    [
      {
        text: '➕ 5 человек 🔊',
        callback_data: ACTION_TYPES.ACTION_TYPE_5_PEOPLE
      },
      {
        text: '➕ 10 человек 📣',
        callback_data: ACTION_TYPES.ACTION_TYPE_10_PEOPLE
      }
    ],
    [
      {
        text: 'Обновить информацию',
        callback_data: ACTION_TYPES.REQUEST_UPDATE
      }
    ]
  ]
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

bot.on('message', async (ctx) => {
  incrementCounter(ctx)
  setLatestMessageID(ctx)
  /*
   * Handle the case when user
   * sends the location
   */
  let location = ctx.message.location
  if (location) {
    ctx.session.location = location || {}
    ctx.session.location = location

    await api.users.updateTelegramUserLocation(
      ctx.from.id,
      location.latitude,
      location.longitude
    )
  }

  ctx.reply(`hello world! ${ctx.session.counter}`, {
    parse_mode: 'markdown',
    reply_markup: {
      inline_keyboard: app.MAIN_KEYBOARD
    }
  })
})

function getLocalElectionsInfo() {
  return [
    `На текущий момент зарегистрировано:`,
    `На вашем участке: 43 человека`,
    `В вашем городе: 125 человек`,
    'В области: 1235 человек',
    `В стране: ${Math.floor(Math.random() * 1234)} человека`
  ].join('\n')
}

bot.action(ACTION_TYPES.ACTION_TYPE_5_PEOPLE, async (ctx) => {
  console.log(ctx)
  ctx.answerCbQuery('+5 человек успешно посчитаны')
  if (ctx.session.latestMessageId) {
    const message = await ctx.editMessageText(getLocalElectionsInfo(), {
      parse_mode: 'markdown',
      reply_markup: {
        inline_keyboard: app.MAIN_KEYBOARD
      }
    })
    console.log('message', message)
  }
})

bot.action(ACTION_TYPES.ACTION_TYPE_10_PEOPLE, (ctx) => {
  ctx.answerCbQuery('+10 человек успешно посчитаны')
  console.log('10 people')
})

bot.action(ACTION_TYPES.REQUEST_UPDATE, (ctx) => {
  ctx.answerCbQuery(`Обновлено, ${getTime()}`)
})

bot.action(ACTION_TYPES.SEND_REQUEST_LOCATION, (ctx) => {
  ctx.reply('Пожалуйста, отправьте нам своё местоположение, чтобы мы могли определить ваш участок.', {
    reply_markup: {
      keyboard: [
        [{
          text: 'Отправить местоположение',
          request_location: true
        }]
      ],
      resize_keyboard: true
    }
  })
})

bot.on('callback_query', (ctx) => {
  console.log(ctx)
  ctx.answerCbQuery('Засчитано')
})

bot.startPolling()