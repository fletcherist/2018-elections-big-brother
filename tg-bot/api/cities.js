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

async function incrementElectorsCountOnCity(cityId, incrementValue) {
  const city = await City.findById(cityId)
  city.electorsCount = city.electorsCount + incrementValue
  return await city.save()
}

module.exports.createCity = createCity
module.exports.findCityByName = findCityByName
module.exports.incrementElectorsCountOnCity = incrementElectorsCountOnCity
