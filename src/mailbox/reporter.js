const ipc = window.nativeRequire('electron').ipcRenderer

class Reporter {
  reportError(errorStr) {
    ipc.send('report-error', { error:errorStr })
  }
}

module.exports = new Reporter()