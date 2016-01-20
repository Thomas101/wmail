'use strict'

const Menu = require('menu')
// const electronLocalshortcut = require('electron-localshortcut')

module.exports = {
  /**
  * @param selectors: the selectors for the non-standard actions
  * @param mailboxes: the mailboxes that the app has
  * @return the menu
  */
  build: function (selectors, mailboxes) {
    return Menu.buildFromTemplate([
      {
        label: 'Application',
        submenu: [
          { label: 'About', selector: 'orderFrontStandardAboutPanel:' },
          { type: 'separator' },
          { label: 'Hide Window', accelerator: 'Command+W', role: 'hide' },
          { label: 'Quit', accelerator: 'Command+Q', click: selectors.fullQuit }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
          { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
          { label: 'Paste and match style', accelerator: 'Command+Shift+V', selector: 'pasteAndMatchStyle:' },
          { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { label: 'Toggle Full Screen', accelerator: 'Ctrl+Command+F', click: selectors.fullscreenToggle },
          { type: 'separator' },
          { label: 'Zoom Mailbox In', accelerator: 'CmdOrCtrl+Plus', click: selectors.zoomIn },
          { label: 'Zoom Mailbox Out', accelerator: 'CmdOrCtrl+-', click: selectors.zoomOut },
          { label: 'Reset Mailbox Zoom', click: selectors.zoomReset },
          { type: 'separator' },
          { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: selectors.reload },
          { label: 'Developer Tools', accelerator: 'Alt+CmdOrCtrl+J', click: selectors.devTools }
        ]
      },
      {
        label: 'Window',
        role: 'window',
        submenu: [
          { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
          { label: 'Hide', accelerator: 'CmdOrCtrl+H', role: 'hide' }
        ]
        .concat(mailboxes.length ? [{ type: 'separator' }] : [])
        .concat(mailboxes.map((mailbox, index) => {
          return { label: mailbox.email || 'Untitled', accelerator: 'CmdOrCtrl+' + (index + 1), click: () => { selectors.mailbox(mailbox.id) } }
        }))
      },
      {
        label: 'Help',
        role: 'help',
        submenu: [
          { label: 'Project Homepage', click: selectors.learnMore },
          { label: 'Report a Bug', click: selectors.bugReport }
        ]
      }
    ])
  },

  /**
  * Binds the hidden shortcuts that don't appear in the menu to a window
  * @param selectors: the selectors for the non-standard actions
  */
  bindHiddenShortcuts: function (selectors) {
    return
    /* electronLocalshortcut.register('CmdOrCtrl+H', () => {
      selectors.hide()
    }); */
  }
}
