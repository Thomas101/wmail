const { BrowserWindow } = window.nativeRequire('electron').remote
const path = require('path')

class Notification {
  constructor (text, options) {
    this.__options__ = Object.assign({}, options)
    this.browserWindow = new BrowserWindow({
      x: 0,
      y: 0,
      useContentSize: true,
      show: false,
      autoHideMenuBar: true,
      frame: false,
      resizable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      backgroundColor: '#FFF',
      webPreferences: {
        nodeIntegration: true
      }
    })
    console.log(__dirname)
    const lp = 'file://' + path.join(path.dirname(window.location.href.replace('file://', '')), 'notification.html')
    this.browserWindow.loadURL(lp)

    this.browserWindow.once('ready-to-show', () => {
      // this.browserWindow.webContents.executeJavaScript('document.body.textContent="test"')
      this.browserWindow.show()
      this.browserWindow.webContents.openDevTools()
    })

    setTimeout(() => {
      this.close()
    }, 30000)
  }

  close () {
    if (!this.browserWindow) { return }
    this.browserWindow.close()
    this.browserWindow = null
  }
}

module.exports = Notification
