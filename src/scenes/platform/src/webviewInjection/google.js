;(function () {
  'use strict'

  require('./keyboardNavigation')
  require('./clickReport')
  require('./zoomLevel')
  require('./googleWindowOpen')

  const ipc = require('electron').ipcRenderer
  /* const enUS = require('../../../app/node_modules/dictionary-en-us')
  const Spellchecker = require('../../../app/node_modules/nodehun')

  enUS((err, result) => {
    if (!err) {
      const spellchecker = new Spellchecker(result.aff, result.dic)
      require('./spellchecker')(spellchecker)
      require('./contextMenu')(spellchecker)
    } else {
      require('./contextMenu')(null)
    }
  })*/
  require('./contextMenu')(null)

  // Inject some styles
  ;(() => {
    const stylesheet = document.createElement('style')
    stylesheet.innerHTML = `
      a[href*="/SignOutOptions"] {
        visibility: hidden !important;
      }
    `
    const interval = setInterval(() => {
      if (document.head) {
        document.head.appendChild(stylesheet)
        clearInterval(interval)
      }
    }, 500)
  })()

  // Listen for open message
  ipc.on('open-message', (evt, data) => {
    if (window.location.host.indexOf('mail.google') !== -1) {
      window.location.hash = 'inbox/' + data.messageId
    }
  })
})()
