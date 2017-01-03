const {ipcRenderer} = require('electron')
const MAX_MESSAGE_HASH_TIME = 1000 * 60 * 10 // 10 mins

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
      count: this.gmailApi.get.unread_inbox_emails(),
      countTime: new Date().getTime()
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
    const now = new Date().getTime()
    const nextCount = this.gmailApi.get.unread_inbox_emails()
    if (this.state.count !== nextCount || now - this.state.messageHashTime > MAX_MESSAGE_HASH_TIME) {
      this.state.count = nextCount
      this.state.countTime = now
      ipcRenderer.sendToHost({
        type: 'unread-count-changed',
        data: { trigger: 'http-event' }
      })
    }
  }
}

module.exports = GmailChangeEmitter
