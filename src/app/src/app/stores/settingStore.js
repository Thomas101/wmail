const persistence = require('../storage/settingStorage')
const Minivents = require('minivents')
const {
  Settings: {LanguageSettings, OSSettings, ProxySettings, TraySettings, UISettings}
} = require('../../shared/Models')

class SettingStore {
  constructor () {
    Minivents(this)

    // Build the current data
    this.language = new LanguageSettings(persistence.getJSONItem('language', {}))
    this.os = new OSSettings(persistence.getJSONItem('os', {}))
    this.proxy = new ProxySettings(persistence.getJSONItem('proxy', {}))
    this.tray = new TraySettings(persistence.getJSONItem('tray', {}))
    this.ui = new UISettings(persistence.getJSONItem('ui', {}))

    // Listen for changes
    persistence.on('changed:language', () => {
      this.language = new LanguageSettings(persistence.getJSONItem('language', {}))
      this.emit('changed', {})
    })
    persistence.on('changed:os', () => {
      this.language = new OSSettings(persistence.getJSONItem('os', {}))
      this.emit('changed', {})
    })
    persistence.on('changed:proxy', () => {
      this.language = new ProxySettings(persistence.getJSONItem('proxy', {}))
      this.emit('changed', {})
    })
    persistence.on('changed:tray', () => {
      this.language = new TraySettings(persistence.getJSONItem('tray', {}))
      this.emit('changed', {})
    })
    persistence.on('changed:ui', () => {
      this.language = new UISettings(persistence.getJSONItem('ui', {}))
      this.emit('changed', {})
    })
  }
}

module.exports = new SettingStore()
