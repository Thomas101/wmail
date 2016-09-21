;(function () {
  'use strict'

  const spellchecker = require('./spellchecker')
  const contextMenu = require('./contextMenu')
  contextMenu.setSpellchecker(spellchecker)

  require('./keyboardNavigation')
  require('./clickReport')
  require('./googleWindowOpen')
  require('./customCode')

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

  /**
  * Customize UI on settings
  */
  ;(() => {
    const sidebarStylesheet = document.createElement('style')
    sidebarStylesheet.innerHTML = `
      [href="#inbox"][data-ved]>* {
        max-height:33px !important;
        margin-top: 22px;
      }
      [jsaction="global.toggle_main_menu"] {
        margin-top: 5px;
      }
      [jsaction="global.toggle_main_menu"] ~ [data-action-data] {
        margin-top: 21px;
      }
    `
    ipc.on('window-icons-in-screen', (evt, data) => {
      if (data.inscreen) {
        if (!sidebarStylesheet.parentElement) {
          document.head.appendChild(sidebarStylesheet)
        }
      } else {
        if (sidebarStylesheet.parentElement) {
          sidebarStylesheet.parentElement.removeChild(sidebarStylesheet)
        }
      }
    })
  })()

  // Listen for open message
  ipc.on('open-message', (evt, data) => {
    if (window.location.host.indexOf('mail.google') !== -1) {
      window.location.hash = 'inbox/' + data.messageId
    }
  })
})()
