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
  ELECTORS_ATTENDANCE_CALLBACK_REPLY,
  ACTION_TYPES
} = require('./constants')

console.log(api)

/*
 * Setting up MongoDB connection
 */
mongoose.Promise = Promise
const connection = mongoose.connect(config.MONGODB_DATABASE_PATH)

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
        callback_data: ACTION_TYPES.COUNT_1_ELECTOR
      }
    ],
    [
      {
        text: '➕ 5 человек 🔊',
        callback_data: ACTION_TYPES.COUNT_5_ELECTORS
      },
      {
        text: '➕ 10 человек 📣',
        callback_data: ACTION_TYPES.COUNT_10_ELECTORS
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

async function handleNewElectorsAttendance(type, ctx) {
  /* push electors attendance into blockchain */
  try {
    const userId = ctx.from.id
    await api.electorsAttendance.createElectorsAttendanceByTelegram(
      userId, type
    )
  } catch (error) {
    ctx.answerCbQuery('Ошибка при подсчёте')
  }

  ctx.answerCbQuery(ELECTORS_ATTENDANCE_CALLBACK_REPLY[type])

  if (ctx.session.latestMessageId) {
    await ctx.editMessageText(getLocalElectionsInfo(), {
      parse_mode: 'markdown',
      reply_markup: {
        inline_keyboard: app.MAIN_KEYBOARD
      }
    })
  }
}

bot.action(ACTION_TYPES.COUNT_1_ELECTOR, async (ctx) => {
  return await handleNewElectorsAttendance(ACTION_TYPES.COUNT_1_ELECTOR, ctx)
})

bot.action(ACTION_TYPES.COUNT_5_ELECTORS, async (ctx) => {
  return await handleNewElectorsAttendance(ACTION_TYPES.COUNT_5_ELECTORS, ctx)
})

bot.action(ACTION_TYPES.COUNT_10_ELECTORS, async (ctx) => {
  return await handleNewElectorsAttendance(ACTION_TYPES.COUNT_10_ELECTORS, ctx)
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