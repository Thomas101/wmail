const persistence = require('../storage/settingStorage')
const Minivents = require('minivents')
const {
  Settings: {
    AppSettings,
    LanguageSettings,
    NewsSettings,
    OSSettings,
    ProxySettings,
    TraySettings,
    UISettings
  }
} = require('../../shared/Models')

class SettingStore {
  constructor () {
    Minivents(this)

    // Build the current data
    this.app = new AppSettings(persistence.getJSONItem('app', {}))
    this.language = new LanguageSettings(persistence.getJSONItem('language', {}))
    this.news = new NewsSettings(persistence.getJSONItem('news', {}))
    this.os = new OSSettings(persistence.getJSONItem('os', {}))
    this.proxy = new ProxySettings(persistence.getJSONItem('proxy', {}))
    this.tray = new TraySettings(persistence.getJSONItem('tray', {}))
    this.ui = new UISettings(persistence.getJSONItem('ui', {}))

    // Listen for changes
    persistence.on('changed:app', () => {
      const prev = this.language
      this.app = new AppSettings(persistence.getJSONItem('app', {}))
      this.emit('changed', { })
      this.emit('changed:app', { prev: prev, next: this.app })
    })
    persistence.on('changed:language', () => {
      const prev = this.language
      this.language = new LanguageSettings(persistence.getJSONItem('language', {}))
      this.emit('changed', { })
      this.emit('changed:language', { prev: prev, next: this.language })
    })
    persistence.on('changed:news', () => {
      const prev = this.news
      this.news = new NewsSettings(persistence.getJSONItem('news', {}))
      this.emit('changed', { })
      this.emit('changed:news', { prev: prev, next: this.news })
    })
    persistence.on('changed:os', () => {
      const prev = this.os
      this.os = new OSSettings(persistence.getJSONItem('os', {}))
      this.emit('changed', { })
      this.emit('changed:os', { prev: prev, next: this.os })
    })
    persistence.on('changed:proxy', () => {
      const prev = this.proxy
      this.proxy = new ProxySettings(persistence.getJSONItem('proxy', {}))
      this.emit('changed', { })
      this.emit('changed:proxy', { prev: prev, next: this.proxy })
    })
    persistence.on('changed:tray', () => {
      const prev = this.tray
      this.tray = new TraySettings(persistence.getJSONItem('tray', {}))
      this.emit('changed', { })
      this.emit('changed:tray', { prev: prev, next: this.tray })
    })
    persistence.on('changed:ui', () => {
      const prev = this.ui
      this.ui = new UISettings(persistence.getJSONItem('ui', {}))
      this.emit('changed', { })
      this.emit('changed:ui', { prev: prev, next: this.ui })
    })
  }
}

module.exports = new SettingStore()
