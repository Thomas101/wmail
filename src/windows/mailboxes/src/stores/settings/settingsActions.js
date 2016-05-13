const alt = require('../alt')

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
  * Merges the updates in
  * @param updates: an object oto merge into settings
  */
  mergeUpdates (updates) {
    return { updates: updates }
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
    this.setProxyServer({ host: host, port: port, enabled: true })
    return {}
  }

  /**
  * Disables the proxy server
  */
  disableProxyServer () {
    this.setProxyServer({ enabled: false })
    return {}
  }

  setProxyServer (info) { return info }

  /* **************************************************************************/
  // OS Level settings
  /* **************************************************************************/

  /**
  * @param show: true to show the titlebar, false otherwise
  */
  setShowTitlebar (show) {
    return this.mergeUpdates({ showTitlebar: show })
  }

  /**
  * @param show: true to show the badge, false otherwise
  */
  setShowAppBadge (show) {
    return this.mergeUpdates({ showAppBadge: show })
  }

  /**
  * @param show: true to show the app menu, false otherwise
  */
  setShowAppMenu (show) {
    return this.mergeUpdates({ showAppMenu: show })
  }

  /**
  * Toggles the app menu
  */
  toggleAppMenu () { return {} }

  /* **************************************************************************/
  // Tray
  /* **************************************************************************/

  /**
  * @param show: true to show the tray icon, false otherwise
  */
  setShowTrayIcon (show) {
    return this.mergeUpdates({ showTrayIcon: show })
  }

  /**
  * @param show: true to show the unread count in the tray
  */
  setShowTrayUnreadCount (show) {
    return this.mergeUpdates({ showTrayUnreadCount: show })
  }

  /**
  * @param col: the hex colour to make the tray icon
  */
  setTrayReadColor (col) {
    return this.mergeUpdates({ trayReadColor: col })
  }

  /**
  * @param col: the hex colour to make the tray icon
  */
  setTrayUnreadColor (col) {
    return this.mergeUpdates({ trayUnreadColor: col })
  }

  /* **************************************************************************/
  // Spell checker
  /* **************************************************************************/

  /**
  * @param enabled: true to enable the spell checker, false otherwise
  */
  setEnableSpellchecker (enabled) {
    return this.mergeUpdates({ spellcheckerEnabled: enabled })
  }

  /* **************************************************************************/
  // Downloads
  /* **************************************************************************/

  /**
  * @param ask: true to always ask, false otherwise
  */
  setAlwaysAskDownloadLocation (ask) {
    return this.mergeUpdates({ alwaysAskDownloadLocation: ask })
  }

  /**
  * @param path: the path to download files to automatically
  */
  setDefaultDownloadLocation (path) {
    return this.mergeUpdates({ defaultDownloadLocation: path })
  }

  /* **************************************************************************/
  // Sidebar
  /* **************************************************************************/

  /**
  * @param enabled: true to enable the sidebar, false otherwise
  */
  setEnableSidebar (enabled) {
    return this.mergeUpdates({ sidebarEnabled: enabled })
  }

  /**
  * Toggles the sidebar
  */
  toggleSidebar () { return {} }

  /* **************************************************************************/
  // Notifications
  /* **************************************************************************/

  /**
  * @param enabled: true to enable notifications, false otherwise
  */
  setNotificationsEnabled (enabled) {
    return this.mergeUpdates({ notificationsEnabled: enabled })
  }

  /**
  * @param silent: true to make notifications silent, false otherwise
  */
  setNotificationsSilent (silent) {
    return this.mergeUpdates({ notificationsSilent: silent })
  }

  /* **************************************************************************/
  // Notifications
  /* **************************************************************************/

  /**
  * @param background: true to open links in the background
  */
  setOpenLinksInBackground (background) {
    return this.mergeUpdates({ openLinksInBackground: background })
  }

}

module.exports = alt.createActions(SettingsActions)
