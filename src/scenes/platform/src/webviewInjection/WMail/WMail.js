const ClickReport = require('./ClickReport')
const CustomCode = require('./CustomCode')

class WMail {
  constructor () {
    this.clickReport = new ClickReport()
    this.customCode = new CustomCode()
  }
}

module.exports = WMail
