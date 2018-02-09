const mongoose = require('mongoose')
const GlobalStatistics = mongoose.model('GlobalStatistics')
const { PLATFORMS } = require('../constants')

async function initializeGlobalStatistics() {
  const globalStatistics = new GlobalStatistics()
  return await globalStatistics.save()
}

async function incrementElectorsAttendance(incrementValue = 1) {
  try {
    const response = await GlobalStatistics.findOneAndUpdate({}, {
      $inc: {'electorsCount': incrementValue}
    })
    /* if no response, then initialize global statistics */
    if (!response) {
      return initializeGlobalStatistics()
    }

    return response
  } catch (error) {
    // handle this error
    throw new Error(error)
  }
}

async function getGlobalStatistics() {
  try {
    const statistics = await GlobalStatistics.findOne({})
    return statistics
  } catch (error) {
    throw new Error(error)
  }
}

getGlobalStatistics().then(console.log)

module.exports.incrementElectorsAttendance = incrementElectorsAttendance
module.exports.getGlobalStatistics = getGlobalStatistics
