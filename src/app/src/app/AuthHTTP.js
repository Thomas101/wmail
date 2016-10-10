const {BrowserWindow} = require('electron')

class AuthHTTP {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param callback: callback to execute with username and password
  */
  constructor (url, callback) {
    this.window = new BrowserWindow({
      width: 400,
      height: 300,
      frame: false,
      center: true,
      show: true,
      resizable: false,
      alwaysOnTop: true,
      autoHideMenuBar: true
    })
    this.window.loadURL(`file://${__dirname}/AuthHTTP.html`)
    this.window.webContents.on('did-finish-load', () => {
      this.window.webContents.send('requestor', url)
    })
  }
}

module.exports = AuthHTTP
