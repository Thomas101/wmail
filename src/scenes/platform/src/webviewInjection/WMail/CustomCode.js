const ipcRenderer = require('electron').ipcRenderer
const injector = require('../injector')

class CustomCode {
  constructor () {
    ipcRenderer.on('inject-custom-content', this._handleInject_.bind(this))
  }

  _handleInject_ (evt, data) {
    if (data.js) {
      injector.injectJavaScript(data.js)
    }
    if (data.css) {
      injector.injectStyle(data.css)
    }
  }
}

module.exports = CustomCode
