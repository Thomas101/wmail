const CustomCode = require('./CustomCode')

class WMail {
  constructor () {
    this.customCode = new CustomCode()
  }
}

module.exports = WMail
