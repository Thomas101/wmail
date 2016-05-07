const alt = require('../alt')
const actions = require('./settingsActions')
const storage = require('../storage')
const ipc = window.nativeRequire('electron').ipcRenderer

const SETTINGS_KEY = 'App_settings'

class SettingsStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.__settings__ = {}
    this.__onloadSettings__ = {}

    /* ****************************************/
    // Helpers
    /* ****************************************/

    /**
    * @param key: the key to fetch
    * @param def: the default value to return
    * @return the value from settings or the default value
    */
    this.__value__ = (key, def) => {
      return this.__settings__[key] === undefined ? def : this.__settings__[key]
    }

    /**
    * @param key: the key to fetch
    * @param def: the default value to return
    * @return the value from load setting or the default value
    */
    this.__onloadvalue__ = (key, def) => {
      return this.__onloadSettings__[key] === undefined ? def : this.__onloadSettings__[key]
    }

    /**
    * @param key: the key to check
    * @param def: the default value
    * @return true if the value is different to the onload value
    */
    this.__valuediff__ = (key, def) => {
      return this.__value__(key, def) !== this.__onloadvalue__(key, def)
    }

    /* ****************************************/
    // Proxy Server
    /* ****************************************/
    this.getProxyServer = () => {
      return this.__value__('proxyServer', { enabled: false })
    }
    this.proxyServerUrl = () => {
      const proxy = this.getProxyServer()
      return proxy.host + ':' + proxy.port
    }

    /* ****************************************/
    // OS level settings
    /* ****************************************/

    this.showTitlebar = () => {
      return this.__value__('showTitlebar', false)
    }
    this.showTitlebarChanged = () => {
      return this.__valuediff__('showTitlebar', false)
    }
    this.showAppBadge = () => {
      return this.__value__('showAppBadge', true)
    }
    this.showAppMenu = () => {
      if (process.platform === 'win32') {
        return this.__value__('showAppMenu', false)
      } else {
        return this.__value__('showAppMenu', true)
      }
    }

    /* ****************************************/
    // Tray
    /* ****************************************/

    this.showTrayIcon = () => {
      return this.__value__('showTrayIcon', true)
    }

    this.showTrayUnreadCount = () => {
      return this.__value__('showTrayUnreadCount', true)
    }

    this.trayReadColor = () => {
      return this.__value__('trayReadColor')
    }

    this.trayUnreadColor = () => {
      return this.__value__('trayUnreadColor')
    }

    /* ****************************************/
    // Spell checker
    /* ****************************************/

    this.spellcheckerEnabled = () => {
      return this.__value__('spellcheckerEnabled', true)
    }
    this.spellcheckerChanged = () => {
      return this.__valuediff__('spellcheckerEnabled', true)
    }

    /* ****************************************/
    // Downloads
    /* ****************************************/

    this.alwaysAskDownloadLocation = () => {
      return this.__value__('alwaysAskDownloadLocation', true)
    }
    this.defaultDownloadLocation = () => {
      return this.__value__('defaultDownloadLocation', undefined)
    }

    /* ****************************************/
    // Sidebar
    /* ****************************************/

    this.sidebarEnabled = () => {
      return this.__value__('sidebarEnabled', true)
    }

    /* ****************************************/
    // Notifications
    /* ****************************************/

    this.notificationsEnabled = () => {
      return this.__value__('notificationsEnabled', true)
    }
    this.notificationsSilent = () => {
      return this.__value__('notificationsSilent', false)
    }

    /* ****************************************/
    // Interactions
    /* ****************************************/

    this.openLinksInBackground = () => {
      return this.__value__('openLinksInBackground', false)
    }

    /* ****************************************/
    // Higher order
    /* ****************************************/

    /**
    * @return true if the app needs to be restarted to apply the settings
    */
    this.requiresRestart = () => {
      return this.showTitlebarChanged() || this.spellcheckerChanged()
    }

    this.bindListeners({
      handleLoad: actions.LOAD,
      handleSetProxyServer: actions.SET_PROXY_SERVER,
      handleMergeUpdates: actions.MERGE_UPDATES,
      handleToggleSidebar: actions.TOGGLE_SIDEBAR,
      handleToggleAppMenu: actions.TOGGLE_APP_MENU
    })
  }

  /* **************************************************************************/
  // Disk
  /* **************************************************************************/

  persist () {
    storage.set(SETTINGS_KEY, this.__settings__)
    ipc.send('settings-update', this.__settings__)
  }

  /* **************************************************************************/
  // Handlers
  /* **************************************************************************/
  /**
  * Loads the storage from disk
  */
  handleLoad () {
    this.__settings__ = storage.get(SETTINGS_KEY, {})
    this.__onloadSettings__ = Object.freeze(storage.get(SETTINGS_KEY, {}))
  }

  /**
  * Sets the proxy server
  * @param host: the host or undefined
  * @param port: the port or undefined
  */
  handleSetProxyServer ({ host, port, enabled }) {
    if (!enabled) {
      delete this.__settings__.proxyServer
    } else {
      this.__settings__.proxyServer = { host: host, port: port, enabled: true }
    }
    this.persist()
  }

  /**
  * Merges the updates
  * @param updates: the dictionary to merge in
  */
  handleMergeUpdates ({ updates }) {
    this.__settings__ = Object.assign(this.__settings__, updates)
    this.persist()
  }

  /**
  * Toggles the sidebar
  */
  handleToggleSidebar () {
    this.handleMergeUpdates({ updates: { sidebarEnabled: !this.sidebarEnabled() } })
  }

  /**
  * Toggles the app menu
  */
  handleToggleAppMenu () {
    this.handleMergeUpdates({ updates: { showAppMenu: !this.showAppMenu() } })
  }
}

module.exports = alt.createStore(SettingsStore, 'SettingsStore')
