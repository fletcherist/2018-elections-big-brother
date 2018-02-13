var NodeGeocoder = require('node-geocoder')
const { GOOGLE_MAPS_API_KEY } = require('../config')

const options = {
  provider: 'google',
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: GOOGLE_MAPS_API_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null, // 'gpx', 'string', ...
  language: 'ru'
}

const geocoder = NodeGeocoder(options)
async function reverseGeocoding(latitude, longitude) {
  if (!latitude || !longitude) {
    return false
  }
  try {
    const geocodingResults = await geocoder.reverse({
      lat: latitude, lon: longitude
    })
    if (geocodingResults.length > 0) {
      return geocodingResults[0]
    }
    return false
  } catch (error) {
    console.error(error)
    return false
  }
}

module.exports.reverseGeocoding = reverseGeocoding
