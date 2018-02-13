const mongoose = require('mongoose')
const PollingStation = mongoose.model('PollingStation')
const { reverseGeocoding } = require('./geocoding')

const citiesApi = require('./cities')
const { findCityByName, createCity } = require('./cities')

async function getPollingStations(limit = 100) {
  const pollingStations = await PollingStation.find({}).limit(limit)
  return pollingStations
}

getPollingStations().then(async (pollingStations) => {
  const { coordinates } = pollingStations[0].location
  const geoinfo = await reverseGeocoding(coordinates[0], coordinates[1])
  console.log(geoinfo)
})

async function getPollingStationById(id) {
  const pollingStation = await PollingStation.findById(id)
  return pollingStation
}

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

  try {
    const geoinfo = await reverseGeocoding(latitude, longitude)
    pollingStation.formattedAdress = geoinfo.formattedAdress
    pollingStation.zipcode = geoinfo.zipcode
    pollingStation.city = geoinfo.city

    // Find already existed city or create one
    // and attach it to the polling station
    let city = await findCityByName(geoinfo.city)
    if (!city) {
      city = await createCity({
        name: geoinfo.city,
        latitude: latitude,
        longitude: longitude
      })
    }
    pollingStation.sourceCityId = city.id

    await pollingStation.save()
    return pollingStation
  } catch (error) {
    console.error(error)
    return pollingStation
  }
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
  console.log(pollingStationId, value)
  const pollingStation = await PollingStation.findById(pollingStationId)
  pollingStation.electorsCount = pollingStation.electorsCount + value

  // increment electors count on city attached to this polling station
  await citiesApi.incrementElectorsCountOnCity(pollingStation.sourceCityId, value)
  return await pollingStation.save()
}

module.exports.createPollingStation = createPollingStation
module.exports.findPollingStationsByCoordinates = findPollingStationsByCoordinates
module.exports.findNearestPollingStation = findNearestPollingStation
module.exports.isPollingStationExistNear = isPollingStationExistNear
module.exports.getElectorsCountOnPollingStation = getElectorsCountOnPollingStation
module.exports.setElectorsCountOnPollingStation = setElectorsCountOnPollingStation
module.exports.incrementElectorsCountOnPollingStation = incrementElectorsCountOnPollingStation
module.exports.getPollingStationById = getPollingStationById
