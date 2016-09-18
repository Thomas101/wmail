const alt = require('../alt')
const actions = require('./platformActions')
const { app } = window.nativeRequire('electron').remote

class PlatformStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    /* ****************************************/
    // Open at login
    /* ****************************************/

    /**
    * @return true if login preferences are supported on this platform
    */
    this.loginPrefSupported = () => { return process.platform === 'darwin' }

    /**
    * @return true if the login preferences are synced with the os
    */
    this.loginPrefSynced = () => { return process.platform === 'darwin' }

    /**
    * @return { openAtLogin, openAsHidden } or null if not supported / unknown
    */
    this.loginPref = () => {
      if (process.platform === 'darwin') {
        const settings = app.getLoginItemSettings()
        return { openAtLogin: settings.openAtLogin, openAsHidden: settings.openAsHidden }
      } else {
        return null
      }
    }

    /**
    * @return { openAtLogin, openAsHidden }. If state is unknown assumes false for both
    */
    this.loginPrefAssumed = () => {
      const pref = this.loginPref()
      return pref === null ? { openAtLogin: false, openAsHidden: false } : pref
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/
    this.bindListeners({
      handleChangeLoginPref: actions.CHANGE_LOGIN_PREF
    })
  }

  /* **************************************************************************/
  // Handlers: Login
  /* **************************************************************************/

  handleChangeLoginPref ({ openAtLogin, openAsHidden }) {
    if (process.platform === 'darwin') {
      app.setLoginItemSettings({
        openAtLogin: openAtLogin,
        openAsHidden: openAsHidden
      })
    }
  }
}

module.exports = alt.createStore(PlatformStore, 'PlatformStore')
