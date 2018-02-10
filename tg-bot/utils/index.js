function getTime() {
  var dateWithouthSecond = new Date()
  return dateWithouthSecond.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
}

module.exports.getTime = getTime