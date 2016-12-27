const {ipcRenderer} = require('electron')
const injector = require('../injector')
const GinboxApi = require('./GinboxApi')

class GinboxChangeEmitter {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.state = {
      messageHash: this.currentMessageHash
    }

    this.latestMessageInterval = setInterval(this.recheckMessageHash.bind(this), 2000)
    this.clickThrottle = null
    injector.injectBodyEvent('click', this.handleBodyClick)
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get currentMessageHash () {
    const topItem = document.querySelector('[data-item-id]')
    const topHash = topItem ? topItem.getAttribute('data-item-id') : '_'
    const unreadCount = GinboxApi.getVisibleUnreadCount()
    return unreadCount + ':' + topHash
  }

  /* **************************************************************************/
  // Event Handlers
  /* **************************************************************************/

  /**
  * Re-checks the top message id and fires an unread-count-changed event when
  * changed
  */
  recheckMessageHash () {
    const nextMessageHash = this.currentMessageHash
    if (this.state.messageHash !== nextMessageHash) {
      this.state.messageHash = nextMessageHash
      clearTimeout(this.clickThrottle)
      ipcRenderer.sendToHost({
        type: 'unread-count-changed',
        data: { trigger: 'periodic-diff' }
      })
    }
  }

  /**
  * Adds a click event into the body which fires off an unread-count-changed
  * event rather lazily to catch the message hash not working correctly
  */
  handleBodyClick () {
    clearTimeout(this.clickThrottle)
    this.clickThrottle = setTimeout(() => {
      ipcRenderer.sendToHost({
        type: 'unread-count-changed',
        data: { trigger: 'delayed-click' }
      })
    }, 10000)
  }
}

module.exports = GinboxChangeEmitter
