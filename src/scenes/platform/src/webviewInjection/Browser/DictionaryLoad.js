const fs = require('fs')
const path = require('path')
const LanguageSettings = require('../../../../app/shared/Models/Settings/LanguageSettings')
const enUS = require('../../../../app/node_modules/dictionary-en-us')
const pkg = require('../../../../app/package.json')
const AppDirectory = require('../../../../app/node_modules/appdirectory')

const appDirectory = new AppDirectory(pkg.name).userData()
const userDictionariesPath = LanguageSettings.userDictionariesPath(appDirectory)

class DictionaryLoad {
  /* **************************************************************************/
  // Loader Utils
  /* **************************************************************************/

  /**
  * Loads a custom dictionary from disk
  * @param language: the language to load
  * @return promise
  */
  static _loadCustomDictionary_ (language) {
    return new Promise((resolve, reject) => {
      const tasks = [
        { path: path.join(userDictionariesPath, language + '.aff'), type: 'aff' },
        { path: path.join(userDictionariesPath, language + '.dic'), type: 'dic' }
      ].map((desc) => {
        return new Promise((resolve, reject) => {
          fs.readFile(desc.path, (err, data) => {
            err ? reject(Object.assign({ error: err }, desc)) : resolve(Object.assign({ data: data }, desc))
          })
        })
      })

      Promise.all(tasks)
        .then((loaded) => {
          const loadObj = loaded.reduce((acc, load) => {
            acc[load.type] = load.data
            return acc
          }, {})
          resolve(loadObj)
        }, (err) => {
          reject(err)
        })
    })
  }

  /**
  * Loads an inbuilt language
  * @param language: the language to load
  * @return promise
  */
  static _loadInbuiltDictionary_ (language) {
    if (language === 'en_US') {
      return new Promise((resolve, reject) => {
        enUS((err, load) => {
          if (err) {
            reject(err)
          } else {
            resolve({ aff: load.aff, dic: load.dic })
          }
        })
      })
    } else {
      return Promise.reject(new Error('Unknown Dictionary'))
    }
  }

  /* **************************************************************************/
  // Loaders
  /* **************************************************************************/

  /**
  * Loads a dictionary
  * @param language: the language to load
  * @return promise
  */
  static load (language) {
    return new Promise((resolve, reject) => {
      DictionaryLoad._loadInbuiltDictionary_(language).then(
        (dic) => resolve(dic),
        (_err) => {
          DictionaryLoad._loadCustomDictionary_(language).then(
            (dic) => resolve(dic),
            (_err) => reject(new Error('Unknown Dictionary'))
          )
        }
      )
    })
  }
}

module.exports = DictionaryLoad
