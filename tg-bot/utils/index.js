function getTime() {
  var dateWithouthSecond = new Date()
  return dateWithouthSecond.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'})
}

function wordEnding(iNumber, aEndings) {
  var sEnding, i
  iNumber = iNumber % 100
  if (iNumber >= 11 && iNumber <= 19) {
    sEnding = aEndings[2]
  } else {
    i = iNumber % 10
    switch (i) {
      case (1): sEnding = aEndings[0]; break
      case (2):
      case (3):
      case (4): sEnding = aEndings[1]; break
      default: sEnding = aEndings[2]
    }
  }
  return sEnding
}

module.exports.getTime = getTime
module.exports.wordEnding = wordEnding
