const ipcRenderer = require('electron').ipcRenderer
const injector = require('../injector')

class ClickReport {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.throttle = null
    this.throttleCount = 1

    injector.injectBodyEvent('click', this._handleClick_)
  }

  /* **************************************************************************/
  // Handlers
  /* **************************************************************************/

  _handleClick_ (evt) {
    if (this.throttle !== null) {
      clearTimeout(this.throttle)
      this.throttle = null
      this.throttleCount += 0.5
    }
    this.throttle = setTimeout(function () {
      ipcRenderer.sendToHost({
        type: 'page-click',
        throttled: true,
        throttle: 1500 / this.throttleCount
      })
      this.throttleCount = 1
    }, 1500 / this.throttleCount)
  }
}

module.exports = ClickReport
