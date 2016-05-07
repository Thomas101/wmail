'use strict'

const Minivents = require('minivents')
const DB_KEY = 'Settings_Shadow'

class AppSettings {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param localStorage: the localStorage instance
  */
  constructor (localStorage) {
    this.localStorage = localStorage
    Minivents(this)
  }

  /* ****************************************************************************/
  // Updates
  /* ****************************************************************************/

  /**
  * @param settings: the settings to persist
  */
  update (settings) {
    this.localStorage.setItem(DB_KEY, JSON.stringify(settings))
    this.emit('changed', { })
  }

  /**
  * @return the data from localstorage or an empty object
  */
  load () {
    const data = this.localStorage.getItem(DB_KEY)
    return data ? JSON.parse(data) : {}
  }

  /**
  * Loads a single value
  * @param key: the key to load
  * @param def: the default value
  * @return the value or default value
  */
  loadValue (key, def) {
    const data = this.load()
    return data[key] === undefined ? def : data[key]
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  get hasTitlebar () { return this.loadValue('showTitlebar', false) }
  get hasAppMenu () { return this.loadValue('showAppMenu', process.platform === 'win32' ? false : true) }
  get proxyEnabled () { return this.loadValue('proxyServer', { enabled: false }).enabled }
  get proxyHost () { return this.loadValue('proxyServer', { enabled: false }).host }
  get proxyPort () { return this.loadValue('proxyServer', { enabled: false }).port }
  get proxyUrl () { return this.proxyHost + ':' + this.proxyPort }
  get alwaysAskDownloadLocation () { return this.loadValue('alwaysAskDownloadLocation', true) }
  get defaultDownloadLocation () { return this.loadValue('defaultDownloadLocation') }
  get hasTrayIcon () { return this.loadValue('showTrayIcon', true) }
}

module.exports = AppSettings
