const persistence = require('../storage/settingStorage')
const Minivents = require('minivents')
const {
  Settings: {LanguageSettings, OSSettings, ProxySettings, TraySettings, UISettings}
} = require('../../shared/Models')

class SettingStore {
  constructor () {
    Minivents(this)

    // Build the current data
    this.language = new LanguageSettings(persistence.getItem('language', {}))
    this.os = new OSSettings(persistence.getItem('os', {}))
    this.proxy = new ProxySettings(persistence.getItem('proxy', {}))
    this.tray = new TraySettings(persistence.getItem('tray', {}))
    this.ui = new UISettings(persistence.getItem('ui', {}))

    // Listen for changes
    persistence.on('changed:language', () => {
      this.language = new LanguageSettings(persistence.getItem('language', {}))
      this.emit('changed', {})
    })
    persistence.on('changed:os', () => {
      this.language = new OSSettings(persistence.getItem('os', {}))
      this.emit('changed', {})
    })
    persistence.on('changed:proxy', () => {
      this.language = new ProxySettings(persistence.getItem('proxy', {}))
      this.emit('changed', {})
    })
    persistence.on('changed:tray', () => {
      this.language = new TraySettings(persistence.getItem('tray', {}))
      this.emit('changed', {})
    })
    persistence.on('changed:ui', () => {
      this.language = new UISettings(persistence.getItem('ui', {}))
      this.emit('changed', {})
    })
  }
}

module.exports = new SettingStore()
