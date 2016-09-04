const fs = require('fs')
const LanguageSettings = require('../../../app/shared/Models/Settings/LanguageSettings')
const enUS = require('../../../app/node_modules/dictionary-en-us')
const pkg = require('../../../app/package.json')
const AppDirectory = require('../../../app/node_modules/appdirectory')

const appDirectory = new AppDirectory(pkg.name).userData()

class DictioanryLoader {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    const paths = LanguageSettings.customDictionaryPaths(appDirectory)
    this._affPath = paths.aff
    this._dicPath = paths.dic
  }

  /* ****************************************************************************/
  // Loading
  /* ****************************************************************************/

  /**
  * Loads a dictionary
  * @param isCustom: true to load a custom dictionary
  * @return promise with {aff, dic} pre-converted to strings
  */
  load (isCustom) {
    if (isCustom) {
      return new Promise((resolve, reject) => {
        fs.readFile(this._affPath, (err, aff) => {
          if (err) {
            reject(err)
          } else {
            fs.readFile(this._dicPath, (err, dic) => {
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
        enUS((err, load) => {
          if (err) {
            reject(err)
          } else {
            resolve({ aff: load.aff, dic: load.dic })
          }
        })
      })
    }
  }

  /**
  * Loads the spellchecker
  * @param language='en_US': the language that we're loading
  */
  loadFromLanguage (language = 'en_US') {
    return this.load(language !== 'en_US')
  }
}

module.exports = DictioanryLoader
