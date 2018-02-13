const Telegraf = require('telegraf')
const RedisSession = require('telegraf-session-redis')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const mongoose = require('mongoose')
/* Initializing mongoose schemes */
require('./models/mongooseScheme')

const config = require('./config')
const api = require('./api')
const bot = new Telegraf(config.TELEGRAM_API_KEY)

const utils = require('./utils')

console.log(Markup.inlineKeyboard([
  Markup.callbackButton('Pepsi', 'Pepsi')
  ]))

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
 help - Помощь
 aboutverification - О верификации пользователей
 verifyme - Верифицируйте меня
 reportviolation - Сообщить о нарушении
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

const reportScene = new Scene('reportviolation')
const violationsMatch = {
  [ACTION_TYPES.VIOLATION_SELECT_CAROUSEL]: 'Карусель',
  [ACTION_TYPES.VIOLATION_SELECT_DELIVERY]: 'Подвоз',
  [ACTION_TYPES.VIOLATION_SELECT_ILLEGAL_REMOVAL]: 'Меня просят уйти'
}

reportScene.enter((ctx) => {
  ctx.answerCbQuery()
  ctx.session.violationType = null
  ctx.reply('🚨 Заметили нарушение или подозрительное действие? Выберите подходящее из списка. Прикрепите фотографию и оставьте комментарий. Самое интересное мы опубликуем в социальных сетях.', app.renderKeyboard(app.VIOLATIONS_MENU))
})
reportScene.leave((ctx) => {
  ctx.session.violationType = null
  ctx.session.violationPhotoUrl = null
  ctx.session.violationMessage = null
  return botRenderMainMenu(ctx)
})
reportScene.action(ACTION_TYPES.BACK, Stage.leave())
reportScene.action(ACTION_TYPES.CANCEL, Stage.leave())
reportScene.action(ACTION_TYPES.GET_MAIN_MENU, Stage.leave())
reportScene.action(ACTION_TYPES.VIOLATION_SELECT_CAROUSEL, ctx =>
  handleReportViolation(ctx, ACTION_TYPES.VIOLATION_SELECT_CAROUSEL)
)
reportScene.action(ACTION_TYPES.VIOLATION_SELECT_DELIVERY, ctx =>
  handleReportViolation(ctx, ACTION_TYPES.VIOLATION_SELECT_DELIVERY)
)
reportScene.action(ACTION_TYPES.VIOLATION_SELECT_ILLEGAL_REMOVAL, ctx =>
  handleReportViolation(ctx, ACTION_TYPES.VIOLATION_SELECT_ILLEGAL_REMOVAL)
)

reportScene.action(ACTION_TYPES.SEND_VIOLATION_REPORT, async (ctx) => {
  ctx.answerCbQuery()
  if (!ctx.session.violationType) {
    return ctx.editMessageText('Вы не выбрали нарушение из списка', app.renderKeyboard(app.MAIN_KEYBOARD))
  }

  // No text description of the violation report
  if (!ctx.session.violationMessage) {
    return ctx.editMessageText('❗️ Пожалуйста, в двух словах опишите, что произошло', app.renderKeyboard(app.SEND_VIOLATION_REPORT))
  }

  const report = await api.reports.createReport({
    type: ctx.session.violationType,
    telegramUserId: ctx.from.id
  })
  if (!report) {
    return ctx.editMessageText(`🚫 Извините, ошибка. Нарушение «${violationsMatch[ctx.session.violationType]}» не было зафиксировано.`, app.renderKeyboard(app.GO_TO_MAIN_MENU))
  }

  await api.reports.attachDescriptionToReport(ctx.session.violationMessage, report.id)
  if (ctx.session.violationPhotoUrl) {
    await api.reports.attachPhotoToReport(ctx.session.violationPhotoUrl, report.id)
  }

  ctx.editMessageText(`✅ Нарушение «${violationsMatch[ctx.session.violationType]}» успешно зафиксировано. Спасибо, мы проанализируем его и опубликуем в ближайшее время.`, app.renderKeyboard(app.GO_TO_MAIN_MENU))
})

async function handleReportViolation(ctx, violationType) {
  ctx.session.violationType = violationType
  ctx.answerCbQuery()

  if (ctx.session.latestMessageId) {
    await ctx.editMessageText([
      `Вы выбрали нарушение «${violationsMatch[violationType]}»\n`,
      '1️⃣ В двух словах опишите в сообщении, что произошло.',
      '2️⃣ Если сможете, сделайте фотографию и прикрепите её к нарушению.'
    ].join('\n'),
    app.renderKeyboard(app.SEND_VIOLATION_REPORT))
  }
}

const getFullsizePhoto = message => message.photo[message.photo.length - 1].file_id
reportScene.on('photo', async (ctx) => {
  console.log('get some photo', ctx)

  if (!ctx.session.violationType) {
    return ctx.editMessageText('Прежде чем отправлять фото нарушения, пожалуйста, выберите подходящее из списка', app.renderKeyboard(app.VIOLATIONS_MENU))
  }

  // Already attached photo
  if (ctx.session.violationPhotoUrl) {
    return ctx.reply('Вы уже прикрепили фотографию. Опишите в двух словах, что произошло?', app.renderKeyboard(app.SEND_VIOLATION_REPORT))
  }

  ctx.reply('🤖 Обрабатываю изображение...')

  if (ctx.session.violationType) {
    const fileId = getFullsizePhoto(ctx.message)

    const photoUrl = await ctx.telegram.getFileLink(fileId)
    const result = await await api.imageUploader.uploadImageByURL(photoUrl)
    ctx.session.violationPhotoUrl = result.secure_url

    if (ctx.message.caption) {
      ctx.session.violationMessage = ctx.message.caption
      ctx.reply('👍 Описание нарушения сохранёно.')
    }

    return ctx.reply('👍 Фотография нарушения успешно прикреплена', app.renderKeyboard(app.SEND_VIOLATION_REPORT))
  }
})

reportScene.on('message', ctx => {
  if (!ctx.session.violationType) {
    return ctx.reply('Прежде чем описывать нарушение, пожалуйста, выберите подходящее из списка', app.renderKeyboard(app.VIOLATIONS_MENU))
  }

  const message = ctx.message.text
  ctx.session.violationMessage = message
  ctx.reply('👍 Описание нарушения сохранёно. Прикрепите фотографию?', app.renderKeyboard(app.SEND_VIOLATION_REPORT))
})

const stage = new Stage()

stage.register(reportScene)

bot.use(redisSession.middleware())
bot.use(stage.middleware())

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
      Markup.callbackButton('➕ 1 человек 👤', ACTION_TYPES.COUNT_1_ELECTOR)
    ],
    [
      Markup.callbackButton('➕ 2 чел. 👫', ACTION_TYPES.COUNT_5_ELECTORS),
      Markup.callbackButton('➕ 5 чел. 👪', ACTION_TYPES.COUNT_10_ELECTORS)
    ],
    [
      Markup.callbackButton('Обновить информацию', ACTION_TYPES.REQUEST_UPDATE)
    ],
    [
      Markup.callbackButton('Сообщить о нарушении', ACTION_TYPES.REPORT_VIOLATION)
    ]
  ],
  GO_TO_MAIN_MENU: [
    [
      Markup.callbackButton('В главное меню', ACTION_TYPES.GET_MAIN_MENU)
    ]
  ],
  I_AM_ON_THE_POLLING_STATION: [
    [
      Markup.callbackButton('Я на месте', ACTION_TYPES.SEND_REQUEST_LOCATION)
    ]
  ],
  VIOLATIONS_MENU: [
    [
      Markup.callbackButton('🎭 Карусель', ACTION_TYPES.VIOLATION_SELECT_CAROUSEL),
      Markup.callbackButton('🚌 Подвоз', ACTION_TYPES.VIOLATION_SELECT_DELIVERY)
    ],
    [
      Markup.callbackButton('🤐 Меня просят уйти', ACTION_TYPES.VIOLATION_SELECT_ILLEGAL_REMOVAL)
    ],
    [
      Markup.callbackButton('« Назад', ACTION_TYPES.BACK)
    ]
  ],
  SEND_VIOLATION_REPORT: [
    [
      Markup.callbackButton('🔖 Зафиксировать нарушение', ACTION_TYPES.SEND_VIOLATION_REPORT)
    ],
    [
      Markup.callbackButton('Отменить', ACTION_TYPES.CANCEL)
    ]
  ],
  renderKeyboard: keyboard => ({
    parse_mode: 'markdown',
    reply_markup: {
      inline_keyboard: keyboard
    }
  })
}

bot.on('location', async (ctx) => {
  console.log('get some location')
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
    ctx.session.isLocationSet = true
    ctx.session.pollingStationId = pollingStationId

    return ctx.reply('Ваш аккаунт успешно привязан к избирательному участку. Теперь вы можете начинать считать явку /getmainmenu')
  }
})

bot.command('start', async (ctx) => {
  const userInfo = ctx.from

  /*
    check if user exists in mongodb
  */
  if (await api.users.isUserExistByTelegramId(userInfo.id)) {
    /* exists, */
    return botRenderAbout(ctx)
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

  const verificationToken = ctx.message.text.split(' ')[1]
  console.log('verificationToken', verificationToken)
  if (verificationToken) {
    try {
      await api.users.verifyTelegramUser(
        verificationToken, userInfo.id
      )
    } catch (error) {
      console.log(error)
      return ctx.reply('По этой ссылке уже была произведена верификация. Подробнее /aboutverification')
    }
  }

  return botRenderAbout(ctx)
})

function botRequestLocation(ctx) {
  ctx.reply(BOT_TEXT.REQUEST_LOCATION_MESSAGE, Extra.markup(markup =>
    markup
      .resize()
      .keyboard([
        markup.locationRequestButton('Отправить местоположение')
      ])
  ))
}

function botRenderGoToPollingStation(ctx) {
  ctx.reply(BOT_TEXT.SECOND_STEP, app.renderKeyboard(app.I_AM_ON_THE_POLLING_STATION))
}

function botRenderMainMenu(ctx) {
  if (!ctx.session.isLocationSet) {
    return botRenderGoToPollingStation(ctx)
  }
  return ctx.reply(BOT_TEXT.THIRD_STEP, app.renderKeyboard(app.MAIN_KEYBOARD))
}

function botRenderUserProfile(ctx) {
  ctx.reply([`статус: Неверифицирован* (подробнее: /aboutverification)`].join('\n'))
}

function botRenderAboutVerification(ctx) {
  ctx.reply('Верификация наблюдателя — это способ нам понять, что вы считаете явку честно. Верифицированные пользователи получают приоритет при подсчёте явки (в том случае, если на участке несколько наблюдателей-счётчиков), а также имеют возможность верифицировать других пользователей.')
}

function botRenderAbout(ctx) {
  ctx.reply(BOT_TEXT.HELLO_MESSAGE, app.renderKeyboard(app.GO_TO_MAIN_MENU))
}

async function botRenderVerifyMe(ctx) {
  const verificationCode = ctx.message.text.split(' ')[1]
  try {
    const userId = ctx.from.id
    const telegramUser = await api.users.findUserByTelegramId(userId)

    if (telegramUser.isVerified === true) {
      return ctx.reply(BOT_TEXT.ACCOUNT_ALREADY_VERIFIED)
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

function botRenderHelp(ctx) {
  ctx.reply(BOT_TEXT.FAQ_MESSAGE, app.renderKeyboard(app.GO_TO_MAIN_MENU))
}

bot.command('setlocation', botRequestLocation)
bot.command('getmainmenu', botRenderMainMenu)
bot.command('me', botRenderUserProfile)
bot.command('aboutverification', botRenderAboutVerification)
bot.command('verifyme', botRenderVerifyMe)
bot.command('invitefriends', botRenderInviteFriends)
bot.command('help', botRenderHelp)
bot.command('reportviolation', ctx => ctx.scene.enter('reportviolation'))

bot.on('message', async (ctx) => {
  incrementCounter(ctx)
  setLatestMessageID(ctx)
  /*
   * Handle the case when user
   * sends the location
   */

  return botRenderMainMenu(ctx)
})

const counterPeopleEnding = count =>
  [count, utils.wordEnding(count, ['человек', 'человека', 'человек'])].join(' ')
async function getLocalElectionsInfo(ctx) {
  const {
    pollingStation,
    city
  } = await api.users.getTelegramUserInfo(ctx.from.id)

  return [
    `📊 На ${utils.getTime()} MSK явка:\n`,
    `📈 На вашем участке: ${counterPeopleEnding(pollingStation.electorsCount)}`,
    `📉 В городе ${city.name}: ${counterPeopleEnding(city.electorsCount)}`
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
      api.pollingStations.incrementElectorsCountOnPollingStation(
        ctx.session.pollingStationId, ELECTORS_ATTENDANCE_VALUES[type]
      ).then(result => console.log('polling station updated', ELECTORS_ATTENDANCE_VALUES[type]))
    }
  } catch (error) {
    ctx.answerCbQuery('Ошибка при подсчёте')
    // throw new Error(error)
  }

  ctx.answerCbQuery(ELECTORS_ATTENDANCE_CALLBACK_REPLY[type])

  if (ctx.session.latestMessageId) {
    await ctx.editMessageText(await getLocalElectionsInfo(ctx), app.renderKeyboard(app.MAIN_KEYBOARD))
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

bot.action(ACTION_TYPES.REQUEST_UPDATE, async (ctx) => {
  if (ctx.session.latestMessageId) {
    ctx.answerCbQuery(`Обновлено, ${utils.getTime()} MSK`)
    await ctx.editMessageText(await getLocalElectionsInfo(ctx), app.renderKeyboard(app.MAIN_KEYBOARD))
  }
})

bot.action(ACTION_TYPES.GET_MAIN_MENU, botRenderMainMenu)
bot.action(ACTION_TYPES.SEND_REQUEST_LOCATION, botRequestLocation)
bot.action(ACTION_TYPES.REPORT_VIOLATION, ctx => ctx.scene.enter('reportviolation'))

bot.on('callback_query', (ctx) => {
  console.log(ctx)
  ctx.answerCbQuery('Засчитано')
})

bot.startPolling()
bot.catch(error => console.log(error))
