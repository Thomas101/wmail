const alt = require('../alt')
const actions = require('./dictionariesActions')
const dictionaries = require('shared/dictionaries.js')
const LanguageSettings = require('shared/Models/Settings/LanguageSettings')

const fs = require('fs')
const path = require('path')
const pkg = window.appPackage()
const AppDirectory = window.appNodeModulesRequire('appdirectory')
const mkdirp = window.appNodeModulesRequire('mkdirp')
const appDirectory = new AppDirectory(pkg.name).userData()
const userDictionariesPath = LanguageSettings.userDictionariesPath(appDirectory)

class DictionariesStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.installedCustomDictionaries = null
    this.preinstalledDictionaries = ['en_US']
    this.install = {
      id: null,
      lang: null,
      inflight: false,
      success: false,
      error: false
    }

    /* ****************************************/
    // Installed Dictionaries
    /* ****************************************/

    /**
    * @return the list of installed custom dictionaries
    */
    this.getInstalledCustomDictionaries = () => {
      if (this.installedCustomDictionaries === null) {
        this.installedCustomDictionaries = this.crawlCustomDictionariesDirectory()
      }
      return this.installedCustomDictionaries
    }

    /**
    * @return the list of preinstalled dictionaries
    */
    this.getPreinstalledDictionaries = () => { return Array.from(this.preinstalledDictionaries) }

    /**
    * @return the list of all dictionaries
    */
    this.getInstalledDictionaries = () => {
      return this.getPreinstalledDictionaries().concat(this.getInstalledCustomDictionaries())
    }

    /**
    * @return a list of all available dictionaries
    */
    this.getAllDictionaries = () => { return Object.keys(dictionaries) }

    /**
    * @return a list of not installed dictionaries
    */
    this.getUninstalledDictionaries = () => {
      const all = new Set(this.getAllDictionaries())
      this.getInstalledDictionaries().forEach((lang) => {
        all.delete(lang)
      })
      return Array.from(all)
    }

    /**
    * @param lang: the language to get the info for
    * @return the information about this dictionary
    */
    this.getDictionaryInfo = (lang) => { return Object.assign({ lang: lang }, dictionaries[lang]) }

    /**
    * @return a list of uninstalled dictionary infos, sorted by name
    */
    this.sortedUninstalledDictionaryInfos = () => {
      return this.getUninstalledDictionaries()
        .map((lang) => this.getDictionaryInfo(lang))
        .sort((a, b) => {
          if (a.name < b.name) return -1
          if (a.name > b.name) return 1
          return 0
        })
    }

    /**
    * @return a list of installed dictionary infos, sorted by name
    */
    this.sortedInstalledDictionaryInfos = () => {
      return this.getInstalledDictionaries()
        .map((lang) => this.getDictionaryInfo(lang))
        .sort((a, b) => {
          if (a.name < b.name) return -1
          if (a.name > b.name) return 1
          return 0
        })
    }

    /* ****************************************/
    // Installing
    /* ****************************************/

    this.isInstalling = () => { return this.install.id !== null }
    this.installId = () => { return this.install.id }
    this.installLanguage = () => { return this.install.lang }
    this.installInflight = () => { return this.install.inflight }

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      handleStartDictionaryInstall: actions.START_DICTIONARY_INSTALL,
      handleStopDictionaryInstall: actions.STOP_DICTIONARY_INSTALL,
      handlePickDictionaryInstallLanguage: actions.PICK_DICTIONARY_INSTALL_LANGUAGE,
      handleInstallDictionary: actions.INSTALL_DICTIONARY
    })
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Crawls the custom dictionries directory for installed dictionaries
  * @return a list of installed dictionaries
  */
  crawlCustomDictionariesDirectory () {
    let files
    try {
      files = fs.readdirSync(userDictionariesPath)
    } catch (ex) {
      files = []
    }

    const dictionaries = files.reduce((acc, filename) => {
      const ext = path.extname(filename).replace('.', '')
      const lang = path.basename(filename, '.' + ext)
      acc[lang] = acc[lang] || {}
      acc[lang][ext] = true
      return acc
    }, {})
    return Object.keys(dictionaries).filter((lang) => dictionaries[lang].aff && dictionaries[lang].dic)
  }

  /**
  * @param update=undefined: update to merge in
  * @return a blank install
  */
  blankInstall (update) {
    return Object.assign({
      id: null,
      lang: null,
      inflight: false,
      success: false,
      error: false
    }, update)
  }

  /* **************************************************************************/
  // Handlers: Changing Dict
  /* **************************************************************************/

  handleStartDictionaryInstall ({ id }) {
    this.install = this.blankInstall({ id: id })
  }

  handleStopDictionaryInstall () {
    this.install = this.blankInstall()
  }

  handlePickDictionaryInstallLanguage ({ id, lang }) {
    if (this.install.id !== id) { return }
    this.install.lang = lang
  }

  handleInstallDictionary ({ id }) {
    if (this.install.id !== id) { return }
    this.install.inflight = true

    const info = dictionaries[this.install.lang]

    Promise.all([
      Promise.resolve()
        .then(() => window.fetch(info.aff))
        .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
        .then((res) => res.text())
        .then((aff) => { return { aff: aff } }),
      Promise.resolve()
        .then(() => window.fetch(info.dic))
        .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
        .then((res) => res.text())
        .then((dic) => { return { dic: dic } })
    ])
    .then((responses) => {
      const data = responses.reduce((acc, res) => Object.assign(acc, res))
      const affPath = path.join(userDictionariesPath, this.install.lang + '.aff')
      const dicPath = path.join(userDictionariesPath, this.install.lang + '.dic')

      mkdirp.sync(userDictionariesPath)
      fs.writeFileSync(affPath, data.aff)
      fs.writeFileSync(dicPath, data.dic)

      this.install.inflight = false
      this.install.success = true
      this.installedCustomDictionaries = null
      this.emitChange()
    }, (_err) => {
      this.install.inflight = false
      this.install.error = true
      this.emitChange()
    })
  }
}

module.exports = alt.createStore(DictionariesStore, 'DictionariesStore')
