const Telegraf = require('telegraf')
const RedisSession = require('telegraf-session-redis')
const mongoose = require('mongoose')
/* Initializing mongoose schemes */
require('./models/mongooseScheme')

const config = require('./config')
const api = require('./api')
const bot = new Telegraf(config.TELEGRAM_API_KEY)

const utils = require('./utils')

const {
  ELECTORS_ATTENDANCE_CALLBACK_REPLY,
  ELECTORS_ATTENDANCE_VALUES,
  ACTION_TYPES,
  BOT_TEXT
} = require('./constants')

console.log(api)

/* BOT COMMANDS

 setlocation - Я пришёл на участок
 getmainmenu - Главное меню
 me - Мой профиль
 aboutverification - О верификации пользователей
 verifyme - Верифицируйте меня
 */

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

  const [startCommand, verificationCode] = ctx.message.text.split(' ')

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

function botRequestLocation(ctx) {
  ctx.reply(BOT_TEXT.REQUEST_LOCATION_MESSAGE, {
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
}

function botRenderMainMenu(ctx) {
  ctx.reply(`hello world! ${ctx.session.counter}`, {
    parse_mode: 'markdown',
    reply_markup: {
      inline_keyboard: app.MAIN_KEYBOARD
    }
  })
}

function botRenderUserProfile(ctx) {
  ctx.reply([`статус: Неверифицирован* (подробнее: /aboutverification)`].join('\n'))
}

function botRenderAboutVerification(ctx) {
  ctx.reply('Верификация наблюдателя — это способ нам понять, что вы считаете явку честно. Верифицированные пользователи получают приоритет при подсчёте явки (в том случае, если на участке несколько наблюдателей-счётчиков), а также имеют возможность верифицировать других пользователей.')
}

async function botRenderVerifyMe(ctx) {
  const [verifyCommand, verificationCode] = ctx.message.text.split(' ')
  try {
    const userId = ctx.from.id
    const telegramUser = await api.users.findUserByTelegramId(userId)

    if (telegramUser.isVerified === true) {
      return ctx.reply('Ваш аккаунт уже верифицирован. \nТеперь вы можете верифицировать ваших друзей. Подробнее /invitefriends')
    }
    console.log(telegramUser)
  } catch (error) {
    console.log(error)
  }

  /* user has no verification code */
  if (!verificationCode) {
    return ctx.reply([
      `Для верификации аккаунта вам потребуется код.`,
      `Получить его можно тут @fletcherist`,
      `Пример: (/verifyme 806247045b49ebca8d10)`,
      `Подробнее о верификации: /aboutverification`
    ].join('\n'))
  }

  console.log(ctx.message.text)
}

function botRenderInviteFriends(ctx) {

}

bot.command('setlocation', botRequestLocation)
bot.command('getmainmenu', botRenderMainMenu)
bot.command('me', botRenderUserProfile)
bot.command('aboutverification', botRenderAboutVerification)
bot.command('verifyme', botRenderVerifyMe)
bot.command('invitefriends', botRenderInviteFriends)

bot.on('message', async (ctx) => {
  incrementCounter(ctx)
  setLatestMessageID(ctx)
  /*
   * Handle the case when user
   * sends the location
   */
  let location = ctx.message.location
  let telegramId = ctx.from.id
  if (location) {
    ctx.session.location = location || {}
    ctx.session.location = location

    await api.users.updateTelegramUserLocation(
      telegramId,
      location.latitude,
      location.longitude
    )

    const pollingStationId = await api.users.attachTelegramUserPollingStation(telegramId)
    ctx.session.pollingStationId = pollingStationId

    return ctx.reply('Ваш аккаунт успешно привязан к избирательному участку. Теперь вы можете начинать считать явку /getmainmenu')
  }

  return botRenderMainMenu(ctx)
})

function getLocalElectionsInfo() {
  return [
    `На текущий момент зарегистрировано:`,
    `На вашем участке: 43 человека`,
    `В вашем городе: 1253 человека`,
    `В стране: ${Math.floor(Math.random() * 12343)} человек`
  ].join('\n')
}

async function handleNewElectorsAttendance(type, ctx) {
  /* push electors attendance into blockchain */
  try {
    const userId = ctx.from.id

    await api.electorsAttendance.createElectorsAttendanceByTelegram(
      userId, type
    )
    await api.globalStatistics.incrementElectorsAttendance(
      ELECTORS_ATTENDANCE_VALUES[type]
    )
    if (ctx.session.pollingStationId) {
      await api.pollingStations.incrementElectorsCountOnPollingStation(
        ctx.session.pollingStationId, ELECTORS_ATTENDANCE_VALUES[type]
      )
    }
  } catch (error) {
    ctx.answerCbQuery('Ошибка при подсчёте')
    throw new Error(error)
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
  ctx.answerCbQuery(`Обновлено, ${utils.getTime()}`)
})

bot.action(ACTION_TYPES.SEND_REQUEST_LOCATION, botRequestLocation)

bot.on('callback_query', (ctx) => {
  console.log(ctx)
  ctx.answerCbQuery('Засчитано')
})

bot.startPolling()
