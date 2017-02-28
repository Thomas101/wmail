const KeyboardNavigator = require('./KeyboardNavigator')
const Spellchecker = require('./Spellchecker')
const ContextMenu = require('./ContextMenu')
const { ipcRenderer } = require('electron')

class Browser {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.keyboardNavigator = new KeyboardNavigator()
    this.spellchecker = new Spellchecker()
    this.contextMenu = new ContextMenu(this.spellchecker)

    ipcRenderer.on('get-process-memory-info', (evt, data) => {
      ipcRenderer.sendToHost({
        data: process.getProcessMemoryInfo(),
        type: data.__respond__
      })
    })
  }
}

module.exports = Browser
