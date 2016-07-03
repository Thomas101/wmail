module.exports = function (initCallback) {
  'use strict'

  try {
    const electron = require('electron')
    const webFrame = electron.webFrame
    const ipc = electron.ipcRenderer
    const enUS = require('../../../app/node_modules/dictionary-en-us')
    const Typo = require('../../../app/node_modules/typo-js')
    let dictionary

    ipc.on('start-spellcheck', (evt, data) => {
      if (!data.enabled) { return }
      if (dictionary) { return }

      enUS((err, load) => {
        if (err) { return }
        dictionary = new Typo('en_US', load.aff.toString(), load.dic.toString())
        webFrame.setSpellCheckProvider('en-us', true, {
          spellCheck: (text) => {
            return dictionary.check(text)
          }
        })

        if (initCallback) {
          initCallback(dictionary)
        }
      })
    })
  } catch (ex) { }
}
