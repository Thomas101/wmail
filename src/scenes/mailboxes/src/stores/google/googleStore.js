const alt = require('../alt')
const actions = require('./googleActions')

class GoogleStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.profileSync = null
    this.unreadSync = null
    this.notificationSync = null

    this.openProfileRequests = new Map()
    this.openUnreadCountRequests = new Map()

    /* **************************************/
    // Request checkers
    /* **************************************/

    this.hasOpenProfileRequest = (mailboxId) => {
      return (this.openProfileRequests.get(mailboxId) || 0) >= 1
    }

    this.hasOpenUnreadCountRequest = (mailboxId) => {
      return (this.openUnreadCountRequests.get(mailboxId) || 0) >= 1
    }

    /* **************************************/
    // Listeners
    /* **************************************/

    this.bindListeners({
      handleStartPollSync: actions.START_POLLING_UPDATES,
      handleStopPollSync: actions.STOP_POLLING_UPDATES,

      handleSyncMailboxProfile: actions.SYNC_MAILBOX_PROFILE,
      handleSyncMailboxProfileSuccess: actions.SYNC_MAILBOX_PROFILE_SUCCESS,
      handleSyncMailboxProfileFailure: actions.SYNC_MAILBOX_PROFILE_FAILURE,

      handleSyncMailboxUnreadCount: actions.SYNC_MAILBOX_UNREAD_COUNT,
      handleSyncMailboxUnreadCountSuccess: actions.SYNC_MAILBOX_UNREAD_COUNT_SUCCESS,
      handleSyncMailboxUnreadCountFailure: actions.SYNC_MAILBOX_UNREAD_COUNT_FAILURE
    })
  }

  /* **************************************************************************/
  // Pollers
  /* **************************************************************************/

  /**
  * Saves the intervals so they can be cancelled later
  * @profiles: the profiles interval
  * @param unread: the unread interval
  * @param notification: the notification interval
  */
  handleStartPollSync ({profiles, unread, notification}) {
    clearInterval(this.profileSync)
    this.profileSync = profiles
    clearInterval(this.unreadSync)
    this.unreadSync = unread
    clearInterval(this.notificationSync)
    this.notificationSync = notification
  }

  /**
  * Stops any running intervals
  */
  handleStopPollSync () {
    clearInterval(this.profileSync)
    this.profileSync = null
    clearInterval(this.unreadSync)
    this.unreadSync = null
    clearInterval(this.notificationSync)
    this.notificationSync = null
  }

  /* **************************************************************************/
  // Requests
  /* **************************************************************************/

  /**
  * Records that a profile sync req is open
  * @param mailboxId: the id of the mailbox
  */
  handleSyncMailboxProfile ({ mailboxId }) {
    this.openProfileRequests.set((this.openProfileRequests.get(mailboxId) || 0) + 1)
  }

  /**
  * Records that a profile sync req completed
  * @param mailboxId: the id of the mailbox
  */
  handleSyncMailboxProfileSuccess ({ mailboxId }) {
    this.openProfileRequests.set(this.openProfileRequests.get(mailboxId) - 1)
  }

  /**
  * Records that a profile sync req completed
  * @param mailboxId: the id of the mailbox
  */
  handleSyncMailboxProfileFailure ({ mailboxId }) {
    this.openProfileRequests.set(this.openProfileRequests.get(mailboxId) - 1)
  }

  /**
  * Records that a unread count sync req is open
  * @param mailboxId: the id of the mailbox
  */
  handleSyncMailboxUnreadCount ({ mailboxId }) {
    this.openUnreadCountRequests.set((this.openUnreadCountRequests.get(mailboxId) || 0) + 1)
  }

  /**
  * Records that a unread count sync req completed
  * @param mailboxId: the id of the mailbox
  */
  handleSyncMailboxUnreadCountSuccess ({ mailboxId }) {
    this.openUnreadCountRequests.set(this.openUnreadCountRequests.get(mailboxId) - 1)
  }

  /**
  * Records that a unread count sync req completed
  * @param mailboxId: the id of the mailbox
  */
  handleSyncMailboxUnreadCountFailure ({ mailboxId }) {
    this.openUnreadCountRequests.set(this.openUnreadCountRequests.get(mailboxId) - 1)
  }
}

module.exports = alt.createStore(GoogleStore, 'GoogleStore')
