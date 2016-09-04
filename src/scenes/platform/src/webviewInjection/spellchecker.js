module.exports = (function () {
  'use strict'

  const { ipcRenderer, webFrame } = require('electron')
  const dictionaryLoad = require('./dictionaryLoad')
  const dictionaryExcludes = require('../../../app/shared/dictionaryExcludes')
  const elconsole = require('./elconsole')

  let Nodehun
  try {
    Nodehun = require('../../../app/node_modules/wmail-spellchecker')
  } catch (ex) {
    elconsole.error('Failed to initialize spellchecker', ex)
    throw ex
  }

  const spellchecker = {
    nodehun: null,
    language: null
  }

  /**
  * Checks if a word is spelt correctly
  * @param text: the word to check
  * @return true if the work is correct
  */
  const checkWord = function (text) {
    if (dictionaryExcludes[spellchecker.language] && dictionaryExcludes[spellchecker.language].has(text)) {
      return true
    } else {
      return spellchecker.nodehun.isCorrectSync(text)
    }
  }

  /**
  * Updates the spellchecker with the correct language
  * @param language: the language to change the spellcheck to
  */
  const updateSpellchecker = function (language) {
    if (!Nodehun) { return }
    if (spellchecker.language === language) { return }

    spellchecker.language = language
    dictionaryLoad(language).then((dic) => {
      spellchecker.nodehun = new Nodehun(dic.aff, dic.dic)
      webFrame.setSpellCheckProvider('en-us', true, {
        spellCheck: (text) => {
          return checkWord(text)
        }
      })
    }, (err) => elconsole.error('Failed to load dictionary', err))
  }

  ipcRenderer.on('start-spellcheck', (evt, data) => {
    updateSpellchecker(data.language)
  })

  return {
    hasDictionary: () => { return !!spellchecker.nodehun },
    getDictionary: () => { return spellchecker.nodehun },
    check: (text) => { return checkWord(text) },
    suggestions: (text) => { return spellchecker.nodehun.spellSuggestionsSync(text) }
  }
})()
