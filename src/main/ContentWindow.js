'use strict'

const WMailWindow = require('./WMailWindow')
const shell = require('shell')

class ContentWindow extends WMailWindow {

  /* ****************************************************************************/
  // Creation
  /* ****************************************************************************/

  defaultWindowPreferences (partition) {
    return Object.assign(super.defaultWindowPreferences(), {
      minWidth: 400,
      minHeight: 400,
      webPreferences: {
        nodeIntegration: false,
        partition: partition
      }
    })
  }

  start (url, partition) {
    this.createWindow(this.defaultWindowPreferences(partition), url)
  }

  createWindow () {
    super.createWindow.apply(this, Array.from(arguments))
    this.window.webContents.on('new-window', (evt, url) => {
      evt.preventDefault()
      shell.openExternal(url)
    })
  }
}

module.exports = ContentWindow
