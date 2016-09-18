const alt = require('../alt')

class PlatformActions {

  /* **************************************************************************/
  // Login
  /* **************************************************************************/

  /**
  * @param openAtLogin: true to open at login
  * @param openAsHidden: true to open as hidden
  */
  changeLoginPref (openAtLogin, openAsHidden) {
    return { openAtLogin: openAtLogin, openAsHidden: openAsHidden }
  }
}

module.exports = alt.createActions(PlatformActions)
