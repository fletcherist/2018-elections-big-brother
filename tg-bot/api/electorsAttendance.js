const mongoose = require('mongoose')
const ElectorsAttendance = mongoose.model('ElectorsAttendance')
const crypto = require('crypto')
const {
  ELECTORS_ATTENDANCE_TYPES
} = require('../constants')

const sha256 = data => crypto.createHash('sha256').update(data).digest('hex')
const createElectorsAttendanceHash = ({ type, sourceUserId, previousHash }) =>
  sha256([
    type, sourceUserId, previousHash
  ].join(''))

 /*
  * be careful with this method
  * it removes the whole collection
  */
async function truncateElectorsAttendanceDB() {
  return await ElectorsAttendance.remove({})
}

async function initializeElectorsAttendanceBlockchain() {
  await truncateElectorsAttendanceDB()
  return await createGenesisElectorsAttendanceBlock()
}

async function createGenesisElectorsAttendanceBlock() {
  /* check whether there's no any blocks in the blockchain */
  if (await getLatestElectorsAttendance()) {
    /* there's no need to create genesis block */
    return null
  }

  /* otherwise create genesis block */
  const electorsAttendance = new ElectorsAttendance()
  electorsAttendance.type = ELECTORS_ATTENDANCE_TYPES.GENESIS_BLOCK
  electorsAttendance.location = {}
  electorsAttendance.location.latitude = 0
  electorsAttendance.location.longitude = 0
  electorsAttendance.sourceUserId = 0
  electorsAttendance.previousHash = 0
  electorsAttendance.hash = createElectorsAttendanceHash(electorsAttendance)
  return await electorsAttendance.save()
}

async function getLatestElectorsAttendance() {
  const electorsAttendance = await ElectorsAttendance.find().limit(1).sort({$natural: -1})
  return electorsAttendance[0]
}

async function addNewElectorsAttendance() {

}

getLatestElectorsAttendance().then(console.log)
// createGenesisElectorsAttendanceBlock().then(console.log)
// initializeElectorsAttendanceBlockchain()

module.exports.addNewElectorsAttendance = addNewElectorsAttendance
module.exports.getLatestElectorsAttendance = getLatestElectorsAttendance
module.exports.createGenesisElectorsAttendanceBlock = createGenesisElectorsAttendanceBlock