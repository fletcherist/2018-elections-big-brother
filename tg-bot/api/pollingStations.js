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

module.exports.createPollingStation = createPollingStation
module.exports.findPollingStationsByCoordinates = findPollingStationsByCoordinates
module.exports.findNearestPollingStation = findNearestPollingStation
module.exports.isPollingStationExistNear = isPollingStationExistNear
