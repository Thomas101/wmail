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

  /* **************************************************************************/
  // Mailto
  /* **************************************************************************/

  /**
  * Sets if the app is the default mailto link handler
  * @param isCurrentApp: true if this is the handler
  */
  changeMailtoLinkHandler (isCurrentApp) {
    return { isCurrentApp: isCurrentApp }
  }
}

module.exports = alt.createActions(PlatformActions)
