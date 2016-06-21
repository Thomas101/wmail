;(function () {
  'use strict'

  require('./keyboardNavigation')
  require('./clickReport')
  require('./zoomLevel')
  require('./googleWindowOpen')
  require('./spellchecker')
  require('./contextMenu')

  const ipc = require('electron').ipcRenderer

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
