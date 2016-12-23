const alt = require('../alt')
const actions = require('./platformActions')
const { remote } = window.nativeRequire('electron')
const path = require('path')
const fs = require('fs')
const windowsShortcuts = process.platform === 'win32' ? window.appNodeModulesRequire('windows-shortcuts') : null

const WIN32_LOGIN_PREF_MAX_AGE = 1000 * 30 // 30 secs
const WIN32_SHORTCUT_PATH = (() => {
  if (process.platform === 'win32') {
    const appdata = remote.getGlobal('process').env.APPDATA
    if (appdata) {
      return path.join(appdata, 'Microsoft\\Windows\\Start Menu\\Programs\\Startup\\WMail.lnk')
    } else {
      return undefined
    }
  } else {
    return undefined
  }
})()

class PlatformStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.win32LoginPrefs = {
      lastSynced: 0,
      openAtLogin: false,
      openAsHidden: false
    }

    /* ****************************************/
    // Open at login
    /* ****************************************/

    /**
    * @return true if login preferences are supported on this platform
    */
    this.loginPrefSupported = () => { return process.platform === 'darwin' || process.platform === 'win32' }

    /**
    * @return { openAtLogin, openAsHidden } or null if not supported / unknown
    */
    this.loginPref = () => {
      if (process.platform === 'darwin') {
        const settings = remote.app.getLoginItemSettings()
        return {
          openAtLogin: settings.openAtLogin,
          openAsHidden: settings.openAsHidden
        }
      } else if (process.platform === 'win32') {
        this.resyncWindowsLoginPref()
        return {
          openAtLogin: this.win32LoginPrefs.openAtLogin,
          openAsHidden: this.win32LoginPrefs.openAsHidden
        }
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
    // Default Mail handler
    /* ****************************************/

    /**
    * @return true if the platform supports mailto
    */
    this.mailtoLinkHandlerSupported = () => { return process.platform === 'darwin' || process.platform === 'win32' }

    /**
    * @return true if this app is the default mailto link handler
    */
    this.isMailtoLinkHandler = () => {
      if (process.platform === 'darwin' || process.platform === 'win32') {
        return remote.app.isDefaultProtocolClient('mailto')
      } else {
        return false
      }
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/
    this.bindListeners({
      handleChangeLoginPref: actions.CHANGE_LOGIN_PREF,
      handleChangeMailtoLinkHandler: actions.CHANGE_MAILTO_LINK_HANDLER
    })
  }

  /* **************************************************************************/
  // Login utils
  /* **************************************************************************/

  /**
  * Resyncs the windows login pref if enough time has elapsed
  */
  resyncWindowsLoginPref () {
    const now = new Date().getTime()
    if (now - this.win32LoginPrefs.lastSynced < WIN32_LOGIN_PREF_MAX_AGE) { return }

    this.win32LoginPrefs.lastSynced = now
    windowsShortcuts.query(WIN32_SHORTCUT_PATH, (err, info) => {
      if (err) {
        this.win32LoginPrefs.openAtLogin = false
        this.win32LoginPrefs.openAsHidden = false
      } else {
        this.win32LoginPrefs.openAtLogin = true
        this.win32LoginPrefs.openAsHidden = (info.args || '').indexOf('--hidden') !== -1
      }
      this.emitChange()
    })
  }

  /* **************************************************************************/
  // Handlers: Login
  /* **************************************************************************/

  handleChangeLoginPref ({ openAtLogin, openAsHidden }) {
    if (process.platform === 'darwin') {
      remote.app.setLoginItemSettings({
        openAtLogin: openAtLogin,
        openAsHidden: openAsHidden
      })
    } else if (process.platform === 'win32') {
      if (openAtLogin) {
        windowsShortcuts.query(WIN32_SHORTCUT_PATH, (err) => {
          const func = err ? windowsShortcuts.create : windowsShortcuts.edit
          func(WIN32_SHORTCUT_PATH, {
            target: process.argv[0],
            args: openAsHidden ? '--hidden' : ''
          }, (err) => {
            if (!err) {
              this.win32LoginPrefs.lastSynced = new Date().getTime()
              this.win32LoginPrefs.openAtLogin = true
              this.win32LoginPrefs.openAsHidden = openAsHidden
              this.emitChange()
            }
          })
        })
      } else {
        fs.unlink(WIN32_SHORTCUT_PATH, (err) => {
          if (!err) {
            this.win32LoginPrefs.lastSynced = new Date().getTime()
            this.win32LoginPrefs.openAtLogin = false
            this.win32LoginPrefs.openAsHidden = false
            this.emitChange()
          }
        })
      }
    }
  }

  /* **************************************************************************/
  // Handlers: Mailto
  /* **************************************************************************/

  handleChangeMailtoLinkHandler ({ isCurrentApp }) {
    if (isCurrentApp) {
      remote.app.setAsDefaultProtocolClient('mailto')
    } else {
      remote.app.removeAsDefaultProtocolClient('mailto')
    }
  }
}

module.exports = alt.createStore(PlatformStore, 'PlatformStore')
