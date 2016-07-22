const alt = require('../alt')
const actions = require('./settingsActions')
const persistence = require('./settingsPersistence')
const {
  Settings: {LanguageSettings, OSSettings, ProxySettings, TraySettings, UISettings, SettingsIdent}
} = require('shared/Models')
const migration = require('./migration')

class SettingsStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.language = null
    this.os = null
    this.proxy = null
    this.tray = null
    this.ui = null

    this.bindListeners({
      handleLoad: actions.LOAD,
      handleUpdate: actions.UPDATE,
      handleToggleBool: actions.TOGGLE
    })
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  handleLoad () {
    console.log('loada')
    // Migrate
    migration.from_1_3_1()
    console.log(1)

    // Load everything
    this.language = new LanguageSettings(persistence.getJSONItemSync('language', {}))
    console.log(2)
    this.os = new OSSettings(persistence.getJSONItemSync('os', {}))
    console.log(3)
    this.proxy = new ProxySettings(persistence.getJSONItemSync('proxy', {}))
    console.log(4)
    this.tray = new TraySettings(persistence.getJSONItemSync('tray', {}))
    console.log(5)
    this.ui = new UISettings(persistence.getJSONItemSync('ui', {}))
    console.log('loadb')
  }

  /* **************************************************************************/
  // Changing
  /* **************************************************************************/

  /**
  * @param segment: the segement string
  * @return the store object for this segment
  */
  storeKeyFromSegment (segment) {
    switch (segment) {
      case SettingsIdent.SEGMENTS.LANGUAGE: return 'language'
      case SettingsIdent.SEGMENTS.OS: return 'os'
      case SettingsIdent.SEGMENTS.PROXY: return 'proxy'
      case SettingsIdent.SEGMENTS.TRAY: return 'tray'
      case SettingsIdent.SEGMENTS.UI: return 'ui'
    }
  }

  /**
  * @param segment: the segment string
  * @return the store class for this segment
  */
  storeClassFromSegment (segment) {
    switch (segment) {
      case SettingsIdent.SEGMENTS.LANGUAGE: return LanguageSettings
      case SettingsIdent.SEGMENTS.OS: return OSSettings
      case SettingsIdent.SEGMENTS.PROXY: return ProxySettings
      case SettingsIdent.SEGMENTS.TRAY: return TraySettings
      case SettingsIdent.SEGMENTS.UI: return UISettings
    }
  }

  /**
  * @param segment: the segement string
  * @return the key for the persistence store
  */
  persistenceKeyFromSegment (segment) {
    switch (segment) {
      case SettingsIdent.SEGMENTS.LANGUAGE: return 'language'
      case SettingsIdent.SEGMENTS.OS: return 'os'
      case SettingsIdent.SEGMENTS.PROXY: return 'proxy'
      case SettingsIdent.SEGMENTS.TRAY: return 'tray'
      case SettingsIdent.SEGMENTS.UI: return 'ui'
    }
  }

  /**
  * Updates a segment
  * @param segment: the name of the segment to update
  * @param updates: k-> of update to apply
  */
  handleUpdate ({ segment, updates }) {
    const storeKey = this.storeKeyFromSegment(segment)
    const StoreClass = this.storeClassFromSegment(segment)
    const persistenceKey = this.persistenceKeyFromSegment(segment)

    const js = this[storeKey].changeData(updates)
    persistence.setJSONItem(persistenceKey, js)
    this[storeKey] = new StoreClass(js)
  }

  /**
  * Toggles a bool
  * @param segment: the name of the segment
  * @param key: the name of the key to toggle
  */
  handleToggleBool ({ segment, key }) {
    const storeKey = this.storeKeyFromSegment(segment)
    const StoreClass = this.storeClassFromSegment(segment)
    const persistenceKey = this.persistenceKeyFromSegment(segment)

    const js = this[storeKey].cloneData()
    js[key] = !js[key]
    persistence.setJSONItem(persistenceKey, js)
    this[storeKey] = new StoreClass(js)
  }
}

module.exports = alt.createStore(SettingsStore, 'SettingsStore')
