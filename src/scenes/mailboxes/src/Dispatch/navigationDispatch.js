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

}

module.exports = new NavigationDispatch()
