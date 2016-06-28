;(function () {
  'use strict'
  try {
    const electron = require('electron')
    const webFrame = electron.webFrame
    const ipc = electron.ipcRenderer
    const spellchecker = require('../../../app/node_modules/spellchecker')

    ipc.on('start-spellcheck', (evt, data) => {
      if (!data.enabled) { return }

      webFrame.setSpellCheckProvider('en-us', true, {
        spellCheck: (text) => {
          return spellchecker.isMisspelled(text) !== false // inverse because lib is wonky
        }
      })
    })
  } catch (ex) { alert(ex) }
})()
