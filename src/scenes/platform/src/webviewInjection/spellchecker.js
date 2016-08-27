module.exports = (function () {
  'use strict'

  const { ipcRenderer, webFrame } = require('electron')
  const request = require('../../../app/node_modules/request')
  const { SPELLCHECK_HTTP_PORT } = require('../../../app/shared/constants')
  const SpellcheckLoader = require('../../../app/shared/SpellcheckManager')
  const enUS = require('../../../app/node_modules/dictionary-en-us')
  const Typo = require('../../../app/node_modules/typo-js')
  const pkg = require('../../../app/package.json')
  const AppDirectory = require('../../../app/node_modules/appdirectory')

  const appDirectory = new AppDirectory(pkg.name).userData()
  const loader = new SpellcheckLoader(appDirectory, enUS, Typo)

  // Listen on the start call
  let dictionary = null
  ipcRenderer.on('start-spellcheck', (evt, data) => {
    if (dictionary) { return }

    loader.loadEngine(data.language).then((dic) => {
      dictionary = dic
      webFrame.setSpellCheckProvider('en-us', true, {
        spellCheck: (text) => {
          return dictionary.check(text)
        }
      })
    })
  })

  return {
    hasDictionary: () => { return !!dictionary },
    getDictionary: () => { return dictionary },
    check: (text) => { return dictionary.check(text) },
    suggestions: (text) => {
      return new Promise((resolve, reject) => {
        request('http://localhost:' + SPELLCHECK_HTTP_PORT + '/suggest?word=' + encodeURIComponent(text), (err, response, body) => {
          if (err) {
            reject(err)
          } else {
            resolve(JSON.parse(body))
          }
        })
      })
    }
  }
})()
