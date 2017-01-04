const injector = require('../injector')
const Browser = require('../Browser/Browser')
const WMail = require('../WMail/WMail')

class GoogleService {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.browser = new Browser()
    this.wmail = new WMail()

    injector.injectStyle(`
      a[href*="/SignOutOptions"] {
        visibility: hidden !important;
      }
    `)
  }
}

module.exports = GoogleService
