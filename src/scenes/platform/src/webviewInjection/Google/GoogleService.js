const Browser = require('../Browser/Browser')
const WMail = require('../WMail/WMail')

class GoogleService {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()
    this.wmail = new WMail()
  }
}

module.exports = GoogleService
