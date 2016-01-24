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
  // Proxy Server
  /* **************************************************************************/

  /**
  * Enables the proxy server
  * @param host: the host
  * @param port: the port
  */
  enableProxyServer (host, port) {
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
  setShowTitlebar (show) { return { show: show } }

  /**
  * @param show: true to show the badge, false otherwise
  */
  setShowAppBadge (show) { return { show: show } }

}

module.exports = alt.createActions(SettingsActions)
