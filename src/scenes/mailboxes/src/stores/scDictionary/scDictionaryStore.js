const alt = require('../alt')
const actions = require('./scDictionaryActions')
const settingsActions = require('../settings/settingsActions')
const remoteDictionaries = require('shared/remoteDictionaries.json')
const LanguageSettings = require('shared/Models/Settings/LanguageSettings')

const fs = require('fs')
const path = require('path')
const pkg = window.appPackage()
const AppDirectory = window.appNodeModulesRequire('appdirectory')
const mkdirp = window.appNodeModulesRequire('mkdirp')
const appDirectory = new AppDirectory(pkg.name).userData()

class SCDictionaryStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.changeId = 0
    this.changeTo = undefined
    this.dictionaryInstall = {
      inflight: false,
      success: false,
      error: false
    }

    /* ****************************************/
    // Changing
    /* ****************************************/

    /**
    * @return true if the dictionary is changing
    */
    this.isChangingDictionary = () => { return this.changeTo !== undefined }

    /**
    * @return the unique id for the dictionary
    */
    this.changingDictionaryId = () => { return this.changeId }

    /**
    * @return the language trying to change to
    */
    this.changingDictionaryLang = () => { return this.changeTo }

    /* ****************************************/
    // Installing
    /* ****************************************/

    /**
    * @return true if the app is installing
    */
    this.isInstalling = () => { return this.dictionaryInstall.inflight }

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      handleStartDictionaryChange: actions.START_DICTIONARY_CHANGE,
      handleFinishDictionaryChange: actions.FINISH_DICTIONARY_CHANGE,
      handleInstallDictionary: actions.INSTALL_DICTIONARY
    })
  }

  /* **************************************************************************/
  // Handlers: Changing Dict
  /* **************************************************************************/

  handleStartDictionaryChange ({ id, lang }) {
    this.changeId = id
    this.changeTo = lang
    this.dictionaryInstall = { inflight: false, success: false, error: false }
  }

  handleFinishDictionaryChange () {
    this.changeId = 0
    this.changeTo = undefined
    this.dictionaryInstall = { inflight: false, success: false, error: false }
  }

  handleInstallDictionary () {
    if (this.dictionaryInstall.inflight || !this.changeTo) { return }
    const changeTo = this.changeTo
    const info = remoteDictionaries[changeTo]

    this.dictionaryInstall = { inflight: true, success: false, error: false }

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
      const paths = LanguageSettings.customDictionaryPaths(appDirectory)

      mkdirp.sync(path.dirname(paths.aff))
      fs.writeFileSync(paths.aff, data.aff)
      mkdirp.sync(path.dirname(paths.dic))
      fs.writeFileSync(paths.dic, data.dic)

      this.dictionaryInstall = { inflight: false, success: true, error: false }
      settingsActions.setSpellcheckerLanguage(changeTo)
      this.emitChange()
    }, (_err) => {
      this.dictionaryInstall = { inflight: false, success: false, error: true }
      this.emitChange()
    })
  }
}

module.exports = alt.createStore(SCDictionaryStore, 'SCDictionaryStore')
