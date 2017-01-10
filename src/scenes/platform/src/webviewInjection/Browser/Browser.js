const KeyboardNavigator = require('./KeyboardNavigator')
const Spellchecker = require('./Spellchecker')
const ContextMenu = require('./ContextMenu')
const { ipcRenderer, webFrame } = require('electron')

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

    ipcRenderer.on('set-zoom-level', (evt, data) => {
      webFrame.setLayoutZoomLevelLimits(-999999, 999999)
      webFrame.setZoomFactor(data.level)
      const ezl = webFrame.getZoomLevel()
      webFrame.setLayoutZoomLevelLimits(ezl, ezl)
    })
  }
}

module.exports = Browser
