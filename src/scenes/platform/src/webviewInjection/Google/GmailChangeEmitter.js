const {ipcRenderer} = require('electron')

class GmailChangeEmitter {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param gmailApi: the gmail api instance
  */
  constructor (gmailApi) {
    this.gmailApi = gmailApi
    this.state = {
      count: this.gmailApi.get.unread_inbox_emails()
    }

    this.gmailApi.observe.on('http_event', this.handleHTTPEvent.bind(this))
  }

  /* **************************************************************************/
  // Event Handlers
  /* **************************************************************************/

  /**
  * Handles gmail firing a http event by checking if the unread count has changed
  * and passing this event up across the bridge
  */
  handleHTTPEvent () {
    const nextCount = this.gmailApi.get.unread_inbox_emails()
    if (this.state.count !== nextCount) {
      this.state.count = nextCount
      ipcRenderer.sendToHost({
        type: 'unread-count-changed',
        data: { trigger: 'http-event' }
      })
    }
  }
}

module.exports = GmailChangeEmitter
