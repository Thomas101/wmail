const {globalShortcut} = require('electron')

/*
 * KeyboardShortcuts registers additional keyboard shortcuts.
 * Note that most keyboard shortcuts are configured with the AppPrimaryMenu.
 */
class KeyboardShortcuts {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (selectors) {
    this._selectors = selectors
    this._shortcuts = []
  }

  /* ****************************************************************************/
  // Creating
  /* ****************************************************************************/

  /**
   * Registers global keyboard shortcuts.
   */
  register () {
    let shortcuts = new Map([
      ['CmdOrCtrl+{', this._selectors.prevMailbox],
      ['CmdOrCtrl+}', this._selectors.nextMailbox]
    ])
    this.unregister()
    shortcuts.forEach((callback, accelerator) => {
      globalShortcut.register(accelerator, callback)
      this._shortcuts.push(accelerator)
    })
  }

  /**
   * Unregisters any previously registered global keyboard shortcuts.
   */
  unregister () {
    this._shortcuts.forEach((accelerator) => {
      globalShortcut.unregister(accelerator)
    })
    this._shortcuts = []
  }

}

module.exports = KeyboardShortcuts
