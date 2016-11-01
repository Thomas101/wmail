const {app} = require('electron')
const settingStore = require('../stores/settingStore')

class WindowManager {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param mailboxesWindow: the main window
  */
  constructor (mailboxesWindow) {
    this.contentWindows = []
    this.mailboxesWindow = mailboxesWindow
    this.forceQuit = false
    this.mailboxesWindow.on('close', (e) => this.handleClose(e))
    this.mailboxesWindow.on('closed', () => {
      this.mailboxesWindow = null
      app.quit()
    })
  }

  /* ****************************************************************************/
  // Events
  /* ****************************************************************************/

  /**
  * Handles the close event by trying to persist the mailbox window
  * @param evt: the event that occured
  */
  handleClose (evt) {
    if (!this.forceQuit) {
      this.contentWindows.forEach((w) => w.close())
      if (process.platform === 'darwin' || settingStore.tray.show) {
        this.mailboxesWindow.hide()
        evt.preventDefault()
        this.forceQuit = false
      }
    }
  }

  /* ****************************************************************************/
  // Adding
  /* ****************************************************************************/

  /**
  * Adds a content window
  * @param window: the window to add
  */
  addContentWindow (window) {
    this.contentWindows.push(window)
    window.on('closed', () => {
      this.contentWindows = this.contentWindows.filter((w) => w !== window)
    })
  }

  /* ****************************************************************************/
  // Actions
  /* ****************************************************************************/

  /**
  * Handles a quit by trying to keep the mailbox window hidden
  */
  quit () {
    this.forceQuit = true
    this.mailboxesWindow.close()
  }

  /**
  * Focuses the next available window
  */
  focusNextWindow () {
    if (this.mailboxesWindow.isFocused()) {
      if (this.contentWindows.length) {
        this.contentWindows[0].focus()
      }
    } else {
      const focusedIndex = this.contentWindows.findIndex((w) => w.isFocused())
      if (focusedIndex === -1 || focusedIndex + 1 >= this.contentWindows.length) {
        this.mailboxesWindow.focus()
      } else {
        this.mailboxesWindow[focusedIndex + 1].focus()
      }
    }
  }

  /**
  * Focuses the main mailboxes window and shows it if it's hidden
  */
  focusMailboxesWindow () {
    if (this.focused() === this.mailboxesWindow) {
      return // If there's already a focused window, do nothing
    }

    if (!this.mailboxesWindow.isVisible()) {
      this.mailboxesWindow.show()
    }
    this.mailboxesWindow.focus()
  }

  /**
  * Toggles the mailboxes window visibility by hiding or showing the mailboxes windoww
  */
  toggleMailboxWindowVisibility () {
    if (this.mailboxesWindow.isVisible()) {
      if (this.focused() === this.mailboxesWindow) {
        this.mailboxesWindow.hide()
      } else {
        this.mailboxesWindow.focus()
      }
    } else {
      this.mailboxesWindow.show()
      this.mailboxesWindow.focus()
    }
  }

  /* ****************************************************************************/
  // Querying
  /* ****************************************************************************/

  /**
  * @return the focused window
  */
  focused () {
    if (this.mailboxesWindow.isFocused()) {
      return this.mailboxesWindow
    } else {
      return this.contentWindows.find((w) => w.isFocused())
    }
  }
}

module.exports = WindowManager
