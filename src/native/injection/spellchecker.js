module.exports = function (callback) {
  'use strict'

  const electron = require('electron')
  const webFrame = electron.webFrame
  const enUS = require('dictionary-en-us')
  const Typo = require('typo-js')
  const ipc = electron.ipcRenderer

  ipc.on('start-spellcheck', (evt, data) => {
    if (!data.enabled) { return }

    enUS((err, load) => {
      if (err) { return }
      const dictionary = new Typo('en_US', load.aff.toString(), load.dic.toString())
      webFrame.setSpellCheckProvider('en-us', true, {
        spellCheck: (text) => {
          return dictionary.check(text)
        }
      })

      if (callback) {
        callback(dictionary)
      }
    })
  })
}
