const {Menu} = require('electron')
const mailboxStore = require('./stores/mailboxStore')

class AppPrimaryMenu {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (selectors) {
    this._selectors = selectors
    this._lastMailboxes = null

    mailboxStore.on('changed', () => {
      this.handleMailboxesChanged()
    })
  }

  /* ****************************************************************************/
  // Creating
  /* ****************************************************************************/

  /**
  * Builds the menu
  * @param mailboxes: the list of mailboxes
  * @return the new menu
  */
  build (mailboxes) {
    return Menu.buildFromTemplate([
      {
        label: 'Application',
        submenu: [
          { label: 'About', click: this._selectors.aboutDialog },
          { type: 'separator' },
          { label: 'Preferences', click: this._selectors.preferences, accelerator: 'CmdOrCtrl+,' },
          { type: 'separator' },
          process.platform === 'darwin' ? { label: 'Services', role: 'services', submenu: [] } : undefined,
          process.platform === 'darwin' ? { type: 'separator' } : undefined,
          { label: 'Show Window', accelerator: 'CmdOrCtrl+N', click: this._selectors.showWindow },
          { label: 'Hide Window', accelerator: 'CmdOrCtrl+W', click: this._selectors.closeWindow },
          { label: 'Hide', accelerator: 'CmdOrCtrl+H', role: 'hide' },
          { label: 'Hide Others', accelerator: 'Alt+CmdOrCtrl+H', role: 'hideothers' },
          { label: 'Show All', role: 'unhide' },
          { type: 'separator' },
          { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: this._selectors.fullQuit }
        ].filter((item) => item !== undefined)
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
          { label: 'Paste and match style', accelerator: 'CmdOrCtrl+Shift+V', selector: 'pasteAndMatchStyle:' },
          { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
          { type: 'separator' },
          { label: 'Find', accelerator: 'CmdOrCtrl+F', click: this._selectors.find },
          { label: 'Find Next', accelerator: 'CmdOrCtrl+G', click: this._selectors.findNext }
        ]
      },
      {
        label: 'View',
        submenu: [
          { label: 'Toggle Full Screen', accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11', click: this._selectors.fullscreenToggle },
          { label: 'Toggle Sidebar', accelerator: (process.platform === 'darwin' ? 'Ctrl+Command+S' : 'Ctrl+alt+S'), click: this._selectors.sidebarToggle },
          process.platform === 'darwin' ? undefined : { label: 'Toggle Menu', accelerator: 'CmdOrCtrl+\\', click: this._selectors.menuToggle },
          { type: 'separator' },
          { label: 'Navigate Back', accelerator: 'CmdOrCtrl+[', click: this._selectors.mailboxNavBack },
          { label: 'Navigate Back', accelerator: 'CmdOrCtrl+Left', click: this._selectors.mailboxNavBack },
          { label: 'Navigate Forward', accelerator: 'CmdOrCtrl+]', click: this._selectors.mailboxNavForward },
          { type: 'separator' },
          { label: 'Zoom Mailbox In', accelerator: 'CmdOrCtrl+Plus', click: this._selectors.zoomIn },
          { label: 'Zoom Mailbox Out', accelerator: 'CmdOrCtrl+-', click: this._selectors.zoomOut },
          { label: 'Reset Mailbox Zoom', accelerator: 'CmdOrCtrl+0', click: this._selectors.zoomReset },
          { type: 'separator' },
          { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: this._selectors.reload },
          { label: 'Developer Tools', accelerator: 'Alt+CmdOrCtrl+J', click: this._selectors.devTools }
        ].filter((item) => item !== undefined)
      },
      {
        label: 'Window',
        role: 'window',
        submenu: [
          { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
          { label: 'Cycle Windows', accelerator: 'CmdOrCtrl+`', click: this._selectors.cycleWindows }
        ]
        .concat(mailboxes.length <= 1 ? [] : [
          { type: 'separator' },
          { label: 'Previous Mailbox', accelerator: 'CmdOrCtrl+<', click: this._selectors.prevMailbox },
          { label: 'Next Mailbox', accelerator: 'CmdOrCtrl+>', click: this._selectors.nextMailbox },
          { type: 'separator' }
        ])
        .concat(mailboxes.length <= 1 ? [] : mailboxes.map((mailbox, index) => {
          return { label: mailbox.email || 'Untitled', accelerator: 'CmdOrCtrl+' + (index + 1), click: () => { this._selectors.changeMailbox(mailbox.id) } }
        }))
      },
      {
        label: 'Help',
        role: 'help',
        submenu: [
          { label: 'WMail Website', click: this._selectors.learnMore },
          { label: 'WMail on GitHub', click: this._selectors.learnMoreGithub },
          { label: 'Report a Bug', click: this._selectors.bugReport }
        ]
      }
    ])
  }

  /**
  * Builds and applies the mailboxes menu
  * @param mailboxes=autoget: the current list of mailboxes
  */
  updateApplicationMenu (mailboxes = mailboxStore.orderedMailboxes()) {
    this._lastMailboxes = mailboxes
    Menu.setApplicationMenu(this.build(mailboxes))
  }

  /* ****************************************************************************/
  // Change events
  /* ****************************************************************************/

  /**
  * Handles the mailboxes changing
  */
  handleMailboxesChanged () {
    if (this._lastMailboxes === null) {
      this.updateApplicationMenu()
    } else {
      // Real lazy compare tbh
      const nextMailboxes = mailboxStore.orderedMailboxes()
      const lastIdent = this._lastMailboxes.map((m) => m.email).join('|')
      const nextIdent = nextMailboxes.map((m) => m.email).join('|')
      if (lastIdent !== nextIdent) {
        this.updateApplicationMenu(nextMailboxes)
      }
    }
  }

  /* ****************************************************************************/
  // Click handlers
  /* ****************************************************************************/

  changeToPrevMailbox () {

  }

  changeToNextMailbox () {

  }
}

module.exports = AppPrimaryMenu
