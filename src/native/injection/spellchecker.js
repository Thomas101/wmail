module.exports = function (spellchecker) {
  'use strict'

  const electron = require('electron')
  const webFrame = electron.webFrame
  const ipc = electron.ipcRenderer

  ipc.on('start-spellcheck', (evt, data) => {
    if (!data.enabled) { return }

    webFrame.setSpellCheckProvider('en-us', true, {
      spellCheck: (text) => {
        return spellchecker.isCorrectSync(text)
      }
    })
  })
}
