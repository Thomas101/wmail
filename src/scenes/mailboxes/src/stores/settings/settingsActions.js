const alt = require('../alt')
const {
  Settings: {SettingsIdent: {SEGMENTS}}
} = require('shared/Models')
const {ipcRenderer} = window.nativeRequire('electron')

class SettingsActions {
  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Indicates the store to drop all data and load from disk
  */
  load () { return {} }

  /* **************************************************************************/
  // Updates
  /* **************************************************************************/

  /**
  * Updates a value
  * @param segment: the segment to update
  * @param changesetOrKey: either a dict of k -> or a single key
  * @param undefinedOrVal: if changesetOrKey is a key, this should be the value
  */
  update (segment, changesetOrKey, undefinedOrVal) {
    if (typeof (changesetOrKey) === 'string') {
      const changeset = {}
      changeset[changesetOrKey] = undefinedOrVal
      return { segment: segment, updates: changeset }
    } else {
      return { segment: segment, updates: changesetOrKey }
    }
  }

  /**
  * Toggles a value
  * @param segment: the segment to update
  * @param key: the key to toggle
  */
  toggle (segment, key) {
    return { segment: segment, key: key }
  }

  /* **************************************************************************/
  // Language
  /* **************************************************************************/

  /**
  * @param enabled: true to enable the spell checker, false otherwise
  */
  setEnableSpellchecker (enabled) {
    return this.update(SEGMENTS.LANGUAGE, 'spellcheckerEnabled', enabled)
  }

  /**
  * @param lang: the language to set to
  */
  setSpellcheckerLanguage (lang) { return {lang: lang} }

  /**
  * @param lang: the language to set to
  */
  setSecondarySpellcheckerLanguage (lang) { return {lang: lang} }

  /* **************************************************************************/
  // OS
  /* **************************************************************************/

  /**
  * @param ask: true to always ask, false otherwise
  */
  setAlwaysAskDownloadLocation (ask) {
    return this.update(SEGMENTS.OS, 'alwaysAskDownloadLocation', ask)
  }

  /**
  * @param path: the path to download files to automatically
  */
  setDefaultDownloadLocation (path) {
    return this.update(SEGMENTS.OS, 'defaultDownloadLocation', path)
  }

  /**
  * @param enabled: true to enable notifications, false otherwise
  */
  setNotificationsEnabled (enabled) {
    return this.update(SEGMENTS.OS, 'notificationsEnabled', enabled)
  }

  /**
  * @param silent: true to make notifications silent, false otherwise
  */
  setNotificationsSilent (silent) {
    return this.update(SEGMENTS.OS, 'notificationsSilent', silent)
  }

  /**
  * @param background: true to open links in the background
  */
  setOpenLinksInBackground (background) {
    return this.update(SEGMENTS.OS, 'openLinksInBackground', background)
  }

  /**
  * @param mode: the login open mode
  */
  setLoginOpenMode (mode) {
    return this.update(SEGMENTS.OS, 'loginOpenMode', mode)
  }

  /* **************************************************************************/
  // Proxy Server
  /* **************************************************************************/

  /**
  * Enables the proxy server
  * @param host: the host
  * @param port: the port
  */
  enableProxyServer (host, port) {
    if (host) {
      if (host.indexOf('://') === -1) {
        host = 'http://' + host
      }
    }
    if (port) {
      port = port.replace(/[^0-9\\.]+/g, '')
    }
    return this.update(SEGMENTS.PROXY, { host: host, port: port, enabled: true })
  }

  /**
  * Disables the proxy server
  */
  disableProxyServer () {
    return this.update(SEGMENTS.PROXY, { enabled: false })
  }

  /* **************************************************************************/
  // UI
  /* **************************************************************************/

  /**
  * @param show: true to show the titlebar, false otherwise
  */
  setShowTitlebar (show) {
    return this.update(SEGMENTS.UI, 'showTitlebar', show)
  }

  /**
  * @param show: true to show the badge, false otherwise
  */
  setShowAppBadge (show) {
    return this.update(SEGMENTS.UI, 'showAppBadge', show)
  }

  /**
  * @param show: true to show the unread count in the titlebar
  */
  setShowTitlebarUnreadCount (show) {
    return this.update(SEGMENTS.UI, 'showTitlebarCount', show)
  }

  /**
  * @param show: true to show the app menu, false otherwise
  */
  setShowAppMenu (show) {
    return this.update(SEGMENTS.UI, 'showAppMenu', show)
  }

  /**
  * Toggles the app menu
  */
  toggleAppMenu () {
    return this.toggle(SEGMENTS.UI, 'showAppMenu')
  }

  /**
  * @param enabled: true to enable the sidebar, false otherwise
  */
  setEnableSidebar (enabled) {
    return this.update(SEGMENTS.UI, 'sidebarEnabled', enabled)
  }

  /**
  * Toggles the sidebar
  */
  toggleSidebar () {
    return this.toggle(SEGMENTS.UI, 'sidebarEnabled')
  }

  /**
  * Opens the app hidden by default
  */
  setOpenHidden (toggled) {
    return this.update(SEGMENTS.UI, 'openHidden', toggled)
  }

  /* **************************************************************************/
  // App
  /* **************************************************************************/

  /**
  * @param ignore: true to ignore the gpu blacklist
  */
  ignoreGPUBlacklist (ignore) {
    return this.update(SEGMENTS.APP, 'ignoreGPUBlacklist', ignore)
  }

  /**
  * @param toggled: true to check for updates
  */
  checkForUpdates (toggled) {
    return this.update(SEGMENTS.APP, 'checkForUpdates', toggled)
  }

  /* **************************************************************************/
  // Tray
  /* **************************************************************************/

  /**
  * @param show: true to show the tray icon, false otherwise
  */
  setShowTrayIcon (show) {
    return this.update(SEGMENTS.TRAY, 'show', show)
  }

  /**
  * @param show: true to show the unread count in the tray
  */
  setShowTrayUnreadCount (show) {
    return this.update(SEGMENTS.TRAY, 'showUnreadCount', show)
  }

  /**
  * @param col: the hex colour to make the tray icon
  */
  setTrayReadColor (col) {
    return this.update(SEGMENTS.TRAY, 'readColor', col)
  }

  /**
  * @param col: the hex colour to make the tray icon background
  */
  setTrayReadBackgroundColor (col) {
    return this.update(SEGMENTS.TRAY, 'readBackgroundColor', col)
  }

  /**
  * @param col: the hex colour to make the tray icon
  */
  setTrayUnreadColor (col) {
    return this.update(SEGMENTS.TRAY, 'unreadColor', col)
  }

  /**
  * @param col: the hex colour to make the tray icon background
  */
  setTrayUnreadBackgroundColor (col) {
    return this.update(SEGMENTS.TRAY, 'unreadBackgroundColor', col)
  }

  /**
  * @param val: the multiplier to apply to the tray icon
  */
  setDpiMultiplier (val) {
    return this.update(SEGMENTS.TRAY, 'dpiMultiplier', parseInt(val))
  }
}

const actions = alt.createActions(SettingsActions)
ipcRenderer.on('toggle-sidebar', actions.toggleSidebar)
ipcRenderer.on('toggle-app-menu', actions.toggleAppMenu)

module.exports = actions
