const ipcRenderer = require('electron').ipcRenderer

class ELConsole {
  /**
  * Logs the supplied arguments and also logs them to the parent frame
  */
  log () {
    ipcRenderer.sendToHost({
      type: 'elevated-log',
      messages: Array.from(arguments)
    })
    console.log.apply(this, Array.from(arguments))
  }

  /**
  * Logs the supplied arguments as errors and also logs them to the parent frame
  */
  error () {
    ipcRenderer.sendToHost({
      type: 'elevated-error',
      messages: Array.from(arguments)
    })
    console.error.apply(this, Array.from(arguments))
  }
}

module.exports = new ELConsole()
