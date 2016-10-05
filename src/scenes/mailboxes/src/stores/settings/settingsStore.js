const alt = require('../alt')
const actions = require('./settingsActions')
const persistence = require('./settingsPersistence')
const dictionaries = require('shared/dictionaries.js')
const {
  Settings: {
    AppSettings,
    LanguageSettings,
    OSSettings,
    ProxySettings,
    TraySettings,
    UISettings,
    SettingsIdent
  }
} = require('shared/Models')
const migration = require('./migration')
const homeDir = window.appNodeModulesRequire('home-dir') // pull this from main thread
const {systemPreferences} = window.nativeRequire('electron').remote
const fs = require('fs')

class SettingsStore {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  /**
  * Generates the themed defaults for the tray
  * @return the defaults
  */
  static generateTrayThemedDefaults () {
    if (process.platform === 'darwin') {
      return {
        readColor: systemPreferences.isDarkMode() ? '#FFFFFF' : '#000000',
        readBackgroundColor: 'transparent',
        unreadColor: '#C82018',
        unreadBackgroundColor: 'transparent'
      }
    } else if (process.platform === 'win32') {
      // Windows is predominantely dark themed, but with no way to check assume it is
      return {
        readColor: '#FFFFFF',
        readBackgroundColor: 'transparent',
        unreadColor: '#C82018',
        unreadBackgroundColor: 'transparent'
      }
    } else if (process.platform === 'linux') {
      let isDark = false
      // GTK
      try {
        const gtkConf = fs.readFileSync(homeDir('.config/gtk-3.0/settings.ini'), 'utf8')
        if (gtkConf.indexOf('gtk-application-prefer-dark-theme=1') !== -1) {
          isDark = true
        }
      } catch (ex) { }

      return {
        readColor: isDark ? '#FFFFFF' : '#000000',
        readBackgroundColor: 'transparent',
        unreadColor: '#C82018',
        unreadBackgroundColor: 'transparent'
      }
    }

    // Catch all
    return {
      readColor: '#000000',
      readBackgroundColor: 'transparent',
      unreadColor: '#C82018',
      unreadBackgroundColor: 'transparent'
    }
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.app = null
    this.language = null
    this.os = null
    this.proxy = null
    this.tray = null
    this.ui = null

    this.bindListeners({
      handleLoad: actions.LOAD,
      handleUpdate: actions.UPDATE,
      handleToggleBool: actions.TOGGLE,

      handleSetSpellcheckerLanguage: actions.SET_SPELLCHECKER_LANGUAGE,
      handleSetSecondarySpellcheckerLanguage: actions.SET_SECONDARY_SPELLCHECKER_LANGUAGE
    })
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  handleLoad () {
    // Migrate
    migration.from_1_3_1()
    this.trayDefaults = SettingsStore.generateTrayThemedDefaults()

    // Load everything
    this.app = new AppSettings(persistence.getJSONItemSync('app', {}))
    this.language = new LanguageSettings(persistence.getJSONItemSync('language', {}))
    this.os = new OSSettings(persistence.getJSONItemSync('os', {}))
    this.proxy = new ProxySettings(persistence.getJSONItemSync('proxy', {}))
    this.tray = new TraySettings(persistence.getJSONItemSync('tray', {}), this.trayDefaults)
    this.ui = new UISettings(persistence.getJSONItemSync('ui', {}))
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
      case SettingsIdent.SEGMENTS.APP: return 'app'
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
      case SettingsIdent.SEGMENTS.APP: return AppSettings
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
      case SettingsIdent.SEGMENTS.APP: return 'app'
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
    if (segment === SettingsIdent.SEGMENTS.TRAY) {
      this[storeKey] = new StoreClass(js, this.trayDefaults)
    } else {
      this[storeKey] = new StoreClass(js)
    }
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
    if (segment === SettingsIdent.SEGMENTS.TRAY) {
      this[storeKey] = new StoreClass(js, this.trayDefaults)
    } else {
      this[storeKey] = new StoreClass(js)
    }
  }

  /* **************************************************************************/
  // Changing : Spellchecker
  /* **************************************************************************/

  handleSetSpellcheckerLanguage ({ lang }) {
    const primaryInfo = dictionaries[lang]
    const secondaryInfo = (dictionaries[this.language.secondarySpellcheckerLanguage] || {})

    if (primaryInfo.charset !== secondaryInfo.charset) {
      this.handleUpdate({
        segment: SettingsIdent.SEGMENTS.LANGUAGE,
        updates: {
          spellcheckerLanguage: lang,
          secondarySpellcheckerLanguage: null
        }
      })
    } else {
      this.handleUpdate({
        segment: SettingsIdent.SEGMENTS.LANGUAGE,
        updates: { spellcheckerLanguage: lang }
      })
    }
  }

  handleSetSecondarySpellcheckerLanguage ({ lang }) {
    if (!lang) {
      this.handleUpdate({
        segment: SettingsIdent.SEGMENTS.LANGUAGE,
        updates: { secondarySpellcheckerLanguage: null }
      })
    } else {
      const primaryInfo = (dictionaries[this.language.spellcheckerLanguage] || {})
      const secondaryInfo = (dictionaries[lang] || {})
      if (primaryInfo.charset === secondaryInfo.charset) {
        this.handleUpdate({
          segment: SettingsIdent.SEGMENTS.LANGUAGE,
          updates: { secondarySpellcheckerLanguage: lang }
        })
      }
    }
  }
}

module.exports = alt.createStore(SettingsStore, 'SettingsStore')
