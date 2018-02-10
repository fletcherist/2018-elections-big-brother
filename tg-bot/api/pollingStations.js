const mongoose = require('mongoose')
const PollingStation = mongoose.model('PollingStation')

async function findPollingStationsByCoordinates(latitude, longitude) {
  const pollingStations = await PollingStation.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [latitude, longitude] },
        $maxDistance: 200
      }
    }
  })
  console.log(pollingStations)
  return pollingStations
}

async function findNearestPollingStation(latitude, longitude) {
  const pollingStations = await findPollingStationsByCoordinates(latitude, longitude)
  return pollingStations[0]
}

async function isPollingStationExistNear(latitude, longitude) {
  const pollingStations = await findNearestPollingStation(latitude, longitude)
  if (!pollingStations) return false
  return true
}
async function createPollingStation({
  name, latitude, longitude, city
}) {
  const pollingStation = new PollingStation()
  if (!latitude || !longitude) {
    throw new Error('PollingStation location is not provided')
  }
  pollingStation.location.type = 'Point'
  pollingStation.location.coordinates = [latitude, longitude]

  if (name) {
    pollingStation.name = name
  }
  if (city) {
    pollingStation.city = city
  }

  await pollingStation.save()
  console.log('New polling station has been created')
  return pollingStation
}

async function getElectorsCountOnPollingStation(pollingStationId) {
  const pollingStation = await PollingStation.findById(pollingStationId)
  return pollingStation.electorsCount
}
async function setElectorsCountOnPollingStation(pollingStationId, value) {
  const pollingStation = await PollingStation.findById(pollingStationId)
  pollingStation.electorsCount = value
  return await pollingStation.save()
}
async function incrementElectorsCountOnPollingStation(pollingStationId, value) {
  const pollingStation = await PollingStation.findById(pollingStationId)
  pollingStation.electorsCount = pollingStation.electorsCount + value
  return await pollingStation.save()
}

module.exports.createPollingStation = createPollingStation
module.exports.findPollingStationsByCoordinates = findPollingStationsByCoordinates
module.exports.findNearestPollingStation = findNearestPollingStation
module.exports.isPollingStationExistNear = isPollingStationExistNear
module.exports.getElectorsCountOnPollingStation = getElectorsCountOnPollingStation
module.exports.setElectorsCountOnPollingStation = setElectorsCountOnPollingStation
module.exports.incrementElectorsCountOnPollingStation = incrementElectorsCountOnPollingStation
