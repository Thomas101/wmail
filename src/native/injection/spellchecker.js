;(function () {
  'use strict'

  const electron = require('electron')
  const webFrame = electron.webFrame
  const ipc = electron.ipcRenderer
  const SpellChecker = require('spellchecker')

  ipc.on('start-spellcheck', (evt, data) => {
    if (!data.enabled) { return }

    webFrame.setSpellCheckProvider('en-us', true, {
      spellCheck: (text) => {
        return !SpellChecker.isMisspelled(text)
      }
    })
  })
})()
