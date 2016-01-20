const alt = require('../alt')
const actions = require('./googleActions')
// const mailboxActions = require('../mailbox/mailboxActions')
// const mailboxStore = require('../mailbox/mailboxStore')

class GoogleStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.profileSync = null
    this.unreadSync = null

    this.bindListeners({
      handleStartPollSync: actions.START_POLL_SYNC,
      handleStopPollSync: actions.STOP_POLL_SYNC
    })
  }

  /* **************************************************************************/
  // Handlers
  /* **************************************************************************/

  /**
  * Saves the intervals so they can be cancelled later
  * @profiles: the profiles interval
  * @param unread: the unread interval
  */
  handleStartPollSync ({profiles, unread}) {
    clearInterval(this.profileSync)
    this.profileSync = profiles
    clearInterval(this.unreadSync)
    this.unreadSync = unread
  }

  /**
  * Stops any running intervals
  */
  handleStopPollSync () {
    clearInterval(this.profileSync)
    this.profileSync = null
    clearInterval(this.unreadSync)
    this.unreadSync = null
  }
}

module.exports = alt.createStore(GoogleStore, 'GoogleStore')
