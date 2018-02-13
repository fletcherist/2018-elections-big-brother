const mongoose = require('mongoose')
const City = mongoose.model('City')

async function createCity({
  name,
  latitude,
  longitude
}) {
  const city = new City({
    name,
    location: {
      type: 'Point',
      coordinates: [latitude, longitude]
    }
  })
  return await city.save()
}

async function findCityByName(name) {
  const city = await City.findOne({name})
  return city || null
}

async function getCityById(id) {
  return await City.findById(id)
}

async function incrementElectorsCountOnCity(cityId, incrementValue) {
  const city = await City.findById(cityId)
  if (!city) return false
  city.electorsCount = city.electorsCount + incrementValue
  return await city.save()
}

async function getElectorsCountOnCity(cityId) {
  const city = await City.findById(cityId)
  if (!city) return false
  return city.electorsCount
}

module.exports.createCity = createCity
module.exports.findCityByName = findCityByName
module.exports.incrementElectorsCountOnCity = incrementElectorsCountOnCity
module.exports.getElectorsCountOnCity = getElectorsCountOnCity
module.exports.getCityById = getCityById