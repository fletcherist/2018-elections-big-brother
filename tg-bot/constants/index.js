const ELECTORS_ATTENDANCE_TYPES = {
  ELECTORS_CAME_1: 'ELECTORS_CAME_1',
  ELECTORS_CAME_5: 'ELECTORS_CAME_2',
  ELECTORS_CAME_10: 'ELECTORS_CAME_5',
  GENESIS_BLOCK: 'GENESIS_BLOCK'
}

/* increment values */
const ELECTORS_ATTENDANCE_VALUES = {
  [ELECTORS_ATTENDANCE_TYPES.ELECTORS_CAME_1]: 1,
  [ELECTORS_ATTENDANCE_TYPES.ELECTORS_CAME_5]: 2,
  [ELECTORS_ATTENDANCE_TYPES.ELECTORS_CAME_10]: 5
}

const PLATFORMS = {
  TELEGRAM: 'telegram'
}

const ACTION_TYPES = {
  COUNT_1_ELECTOR: ELECTORS_ATTENDANCE_TYPES.ELECTORS_CAME_1,
  COUNT_5_ELECTORS: ELECTORS_ATTENDANCE_TYPES.ELECTORS_CAME_5,
  COUNT_10_ELECTORS: ELECTORS_ATTENDANCE_TYPES.ELECTORS_CAME_10,
  SEND_REQUEST_LOCATION: 'SEND_REQUEST_LOCATION',

  REQUEST_UPDATE: 'REQUEST_UPDATE',
  REPORT_VIOLATION: 'REPORT_VIOLATION',

  VIOLATION_SELECT_CAROUSEL: 'VIOLATION_SELECT_CAROUSEL',
  VIOLATION_SELECT_DELIVERY: 'VIOLATION_SELECT_DELIVERY',
  VIOLATION_SELECT_ILLEGAL_REMOVAL: 'VIOLATION_SELECT_ILLEGAL_REMOVAL',
  SEND_VIOLATION_REPORT: 'SEND_VIOLATION_REPORT',

  GET_MAIN_MENU: 'GET_MAIN_MENU',
  BACK: 'BACK',
  CANCEL: 'CANCEL'
}

const REPORT_TYPES = {
  // Карусель
  CAROUSEL: 'CAROUSEL',
  // Подвоз
  DELIVERY: 'DELIVERY',
  // Незаконное удаление наблюдателей
  OBSERVER_ILLEGAL_REMOVAL: 'OBSERVER_ILLEGAL_REMOVAL'
}

const BOT_TEXT = {
  HELLO_MESSAGE: [
    '👨‍🏫 Привет! Я бот-счётчик и я помогу посчитать реальную явку избирателей на выборах 2018. \n',
    '🗣 С помощью меня можно производить подсчёт и сообщать о нарушениях и подозрительных вещах вроде каруселей и подвозов в ходе голосования.\n',
    '🤷‍♀️ Есть вопросы? /help \n',
    'Приступите к использованию приложения:'
  ].join('\n'),
  REQUEST_LOCATION_MESSAGE: '⭐️ Уже на месте? Отлично! (3/3)\n\n🌎 Пожалуйста, отправьте нам своё местоположение, чтобы мы могли определить, на каком вы участке.',
  SECOND_STEP: [
    '📬 (2/3) Придите на избирательный участок \n',
    '👁 Как только вы пришли и готовы, сообщите нам об этом, нажав на кнопку'
  ].join('\n'),
  THIRD_STEP: `🙋‍♂️ (3/3) Вы уже на участке и готовы считать? Как только подходит человек — нажимайте на кнопку.\n 🕵️ Заметили что-то подозрительное? Сообщите об этом нам.`,
  FAQ_MESSAGE: [
    '🆘 FAQ: Наблюдатель-счётчик',
    'Этот бот создан для того, чтобы получить реальную картину о явке в день выборов и зафиксировать нарушения.\n',
    '〽️ Мы проанализируем данные в режиме реального времени, а базу данных опубликуем в открытом доступе сразу после окончания голосования\n',
    '1️⃣ Для того, чтобы начать пользоваться ботом, в день выборов придите на любой избирательный участок в вашем городе и отметьтесь там (команда /setlocation )\n',
    '2️⃣ Далее перейдите в главное меню (команда /getmainmenu) и считайте всех, кто приходит голосовать на участок.',
    '3️⃣ Для того, чтобы сообщить о замеченном нарушении или подозрительном событии, перейдите в меню нарушений (команда /reportviolation)\n',
    '4️⃣ Выберите нужное из списка и, если хотите, прикрепите фото (например, фото подвоза)\n',
    'Остались вопросы? Задайте их разработчику — @fletcherist'
  ].join('\n'),
  ACCOUNT_ALREADY_VERIFIED: 'Ваш аккаунт уже верифицирован. \nТеперь вы можете верифицировать ваших друзей. Подробнее /invitefriends'
}

const ELECTORS_ATTENDANCE_CALLBACK_REPLY = {
  [ACTION_TYPES.COUNT_1_ELECTOR]: '+1 человек успешно посчитан',
  [ACTION_TYPES.COUNT_5_ELECTORS]: '+2 человека успешно посчитаны',
  [ACTION_TYPES.COUNT_10_ELECTORS]: '+5 человек успешно посчитаны'
}

module.exports = {
  PLATFORMS,
  ELECTORS_ATTENDANCE_TYPES,
  ACTION_TYPES
}
module.exports.ELECTORS_ATTENDANCE_TYPES = ELECTORS_ATTENDANCE_TYPES
module.exports.PLATFORMS = PLATFORMS
module.exports.ACTION_TYPES = ACTION_TYPES
module.exports.ELECTORS_ATTENDANCE_CALLBACK_REPLY = ELECTORS_ATTENDANCE_CALLBACK_REPLY
module.exports.ELECTORS_ATTENDANCE_VALUES = ELECTORS_ATTENDANCE_VALUES
module.exports.BOT_TEXT = BOT_TEXT
module.exports.REPORT_TYPES = REPORT_TYPES
