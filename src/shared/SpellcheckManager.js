const fs = require('fs')
const LanguageSettings = require('./Models/Settings/LanguageSettings')
const remoteDictionaries = require('./remoteDictionaries.json')

class SpellcheckManager {

  /* ****************************************************************************/
  // Class
  /* ****************************************************************************/

  static get remoteDictionaries () { return remoteDictionaries }

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (appDirectory, enUSLoader, Typo) {
    const paths = LanguageSettings.customDictionaryPaths(appDirectory)
    this._affPath = paths.aff
    this._dicPath = paths.dic
    this._enUSLoader = enUSLoader
    this._Typo = Typo
  }

  /* ****************************************************************************/
  // Properties
  /* ****************************************************************************/

  get remoteDictionaries () { return remoteDictionaries }

  /* ****************************************************************************/
  // Loading
  /* ****************************************************************************/

  /**
  * Loads a dictionary
  * @param isCustom: true to load a custom dictionary
  * @return promise with {aff, dic} pre-converted to strings
  */
  loadDictionary (isCustom) {
    if (isCustom) {
      return new Promise((resolve, reject) => {
        fs.readFile(this._affPath, 'utf8', (err, aff) => {
          if (err) {
            reject(err)
          } else {
            fs.readFile(this._dicPath, 'utf8', (err, dic) => {
              if (err) {
                reject(err)
              } else {
                resolve({ aff: aff, dic: dic })
              }
            })
          }
        })
      })
    } else {
      return new Promise((resolve, reject) => {
        this._enUSLoader((err, load) => {
          if (err) {
            reject(err)
          } else {
            resolve({ aff: load.aff.toString(), dic: load.dic.toString() })
          }
        })
      })
    }
  }

  /**
  * Loads the spellchecker
  * @param language='en_US': the language that we're loading
  */
  loadEngine (language = 'en_US') {
    return Promise.resolve()
      .then(() => this.loadDictionary(language !== 'en_US'))
      .then((load) => new this._Typo(language, load.aff, load.dic))
  }
}

module.exports = SpellcheckManager
