const Minivents = require('minivents')
const {ipcRenderer} = window.nativeRequire('electron')

class NavigationDispatch {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    Minivents(this)
  }

  /**
  * Binds the listeners to the ipc renderer
  */
  bindIPCListeners () {
    ipcRenderer.on('launch-settings', () => { this.openSettings() })
    return this
  }

  /* **************************************************************************/
  // Actions
  /* **************************************************************************/

  /**
  * Emits an open settings command
  */
  openSettings () {
    this.emit('opensettings', {})
  }

  /**
  * Opens the settings at a mailbox
  * @param mailboxId: the id of the mailbox
  */
  openMailboxSettings (mailboxId) {
    this.emit('opensettings', {
      route: {
        tab: 'accounts',
        mailboxId: mailboxId
      }
    })
  }
}

module.exports = new NavigationDispatch()
