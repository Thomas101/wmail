module.exports = (function () {
  'use strict'

  const { ipcRenderer, webFrame } = require('electron')
  const dictionaryLoad = require('./dictionaryLoad')
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

  ipcRenderer.on('start-spellcheck', (evt, data) => {
    if (!Nodehun) { return }
    if (spellchecker.language === data.language) { return }

    spellchecker.language = data.language
    dictionaryLoad(data.language).then((dic) => {
      spellchecker.nodehun = new Nodehun(dic.aff, dic.dic)
      webFrame.setSpellCheckProvider('en-us', true, {
        spellCheck: (text) => {
          return spellchecker.nodehun.isCorrectSync(text)
        }
      })
    }, (err) => elconsole.error('Failed to load dictionary', err))
  })

  ipcRenderer.on('stop-spellcheck', (evt, data) => {
    spellchecker.nodehun = null
    spellchecker.language = null
    webFrame.setSpellCheckProvider('en-us', true, undefined)
  })

  return {
    hasDictionary: () => { return !!spellchecker.nodehun },
    getDictionary: () => { return spellchecker.nodehun },
    check: (text) => { return spellchecker.nodehun.isCorrectSync(text) },
    suggestions: (text) => { return spellchecker.nodehun.spellSuggestionsSync(text) }
  }
})()
