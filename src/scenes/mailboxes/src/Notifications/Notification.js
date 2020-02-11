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
    const htmlPath = 'file://' + path.join(path.dirname(window.location.href.replace('file://', '')), 'notification.html')
    this.browserWindow.loadURL(htmlPath)
    this.browserWindow.once('ready-to-show', () => {
      this.browserWindow.webContents.executeJavaScript(`window.renderNotification.apply(this, ${JSON.stringify([text, options])})`)
      this.browserWindow.show()
      this.browserWindow.webContents.openDevTools()
    })

    setTimeout(() => {
      this.close()
    }, 3000)
  }

  close () {
    if (!this.browserWindow) { return }
    this.browserWindow.close()
    this.browserWindow = null
  }
}

module.exports = Notification
