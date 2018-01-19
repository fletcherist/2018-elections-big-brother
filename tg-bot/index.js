const Telegraf = require('telegraf')
const RedisSession = require('telegraf-session-redis')

const {
  TELEGRAM_API_KEY,
  REDIS_SESSION_URL
} = require('./config')

console.log(process.env)

const bot = new Telegraf(TELEGRAM_API_KEY)

const redisSession = new RedisSession({
  store: {
    url: REDIS_SESSION_URL
  }
})
bot.use(redisSession.middleware())

function incrementCounter(ctx) {
  ctx.session.counter = ctx.session.counter || 0
  ctx.session.counter++
}

const ACTION_TYPES = {
  ACTION_TYPE_5_PEOPLE: 'ACTION_TYPE_5_PEOPLE',
  ACTION_TYPE_10_PEOPLE: 'ACTION_TYPE_10_PEOPLE',
  SEND_REQUEST_LOCATION: 'SEND_REQUEST_LOCATION',

  LOCATION_RECEIVED: 'LOCATION_RECEIVED'
}

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