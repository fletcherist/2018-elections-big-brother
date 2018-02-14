const mongoose = require('mongoose')
const Report = mongoose.model('Report')
const { REPORT_TYPES } = require('../constants')
const { findUserByTelegramId } = require('./users')

async function createReport({
  type,
  telegramUserId,
}) {
  const user = await findUserByTelegramId(telegramUserId)
  console.log('createReport', user)
  if (!user) return false
  const report = new Report({
    type: type,
    fromUserId: user.id,
    pollingStationId: user.pollingStationId
  })
  return await report.save()
}

async function findReportById(id) {
  return await Report.findById(id)
}

async function attachPhotoToReport(photoUrl, reportId) {
  const report = await Report.findById(reportId)
  report.photoUrl = photoUrl
  return await report.save()
}

async function attachDescriptionToReport(textDescription, reportId) {
  const report = await Report.findById(reportId)
  report.description = textDescription
  return await report.save()
}

module.exports.createReport = createReport
module.exports.attachPhotoToReport = attachPhotoToReport
module.exports.attachDescriptionToReport = attachDescriptionToReport
module.exports.findReportById = findReportById
