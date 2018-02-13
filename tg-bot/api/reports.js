const mongoose = require('mongoose')
const Report = mongoose.model('Report')
const { REPORT_TYPES } = require('../constants')

async function createReport({
  type,
  fromUserId,
  pollingStationId
}) {
  const report = new Report({
    type: type,
    fromUserId: fromUserId,
    pollingStationId: pollingStationId
  })
  return await report.save()
}

async function findReportById(id) {
  return await Report.findById(id)
}

async function attachPhotoToReport(photo) {

}

async function attachCommentToReport(commentText) {

}

module.exports.createReport = createReport
module.exports.attachPhotoToReport = attachPhotoToReport
module.exports.attachCommentToReport = attachCommentToReport
module.exports.findReportById = findReportById
