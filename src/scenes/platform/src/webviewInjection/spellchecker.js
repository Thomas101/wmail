module.exports = (function () {
  'use strict'

  const { ipcRenderer, webFrame } = require('electron')
  const DictionaryLoader = require('./DictionaryLoader')
  const elconsole = require('./elconsole')

  let Nodehun
  try {
    Nodehun = require('../../../app/node_modules/wmail-spellchecker')
  } catch (ex) {
    elconsole.error('Failed to initialize spellchecker', ex)
    throw ex
  }

  const loader = new DictionaryLoader()

  // Listen on the start call
  let spellchecker = null
  ipcRenderer.on('start-spellcheck', (evt, data) => {
    if (!Nodehun) { return }
    if (spellchecker) { return }

    loader.loadFromLanguage(data.language).then((dic) => {
      spellchecker = new Nodehun(dic.aff, dic.dic)
      webFrame.setSpellCheckProvider('en-us', true, {
        spellCheck: (text) => {
          return spellchecker.isCorrectSync(text)
        }
      })
    })
  })

  return {
    hasDictionary: () => { return !!spellchecker },
    getDictionary: () => { return spellchecker },
    check: (text) => { return spellchecker.isCorrectSync(text) },
    suggestions: (text) => { return spellchecker.spellSuggestionsSync(text) }
  }
})()
