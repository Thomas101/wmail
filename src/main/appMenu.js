'use strict'

const Menu = require('menu')

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
          { label: 'Preferences', click: selectors.preferences, accelerator: 'CmdOrCtrl+,' },
          { label: 'About', click: selectors.aboutDialog },
          { type: 'separator' },
          { label: 'Show Window', accelerator: 'Command+N', click: selectors.showWindow },
          { label: 'Hide Window', accelerator: 'Command+W', click: selectors.closeWindow },
          { label: 'Hide', accelerator: 'CmdOrCtrl+H', role: 'hide' },
          { label: 'Hide Others', accelerator: 'Alt+CmdOrCtrl+H', role: 'hideothers' },
          { label: 'Show All', role: 'unhide' },
          { type: 'separator' },
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
          { label: 'Toggle Sidebar', accelerator: 'Ctrl+Command+S', click: selectors.sidebarToggle },
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
          { label: 'Cycle Windows', accelerator: 'CmdOrCtrl+`', click: selectors.cycleWindows }
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
  }
}
