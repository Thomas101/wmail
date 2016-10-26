const Model = require('../Model')

const UNREAD_MODES = {
  INBOX: 'inbox',
  INBOX_UNREAD: 'inbox_unread',
  PRIMARY_INBOX_UNREAD: 'primary_inbox_unread',
  INBOX_UNREAD_IMPORTANT: 'inbox_unread_important'
}

class Google extends Model {

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get UNREAD_MODES () { return UNREAD_MODES }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (auth, config, unreadCounts, unreadMessages, messages) {
    super({
      auth: auth || {},
      config: config || {},
      unreadCounts: unreadCounts || {},
      unreadMessages: unreadMessages || {},
      messages: messages || {}
    })
  }

  /* **************************************************************************/
  // Properties : GoogleAuth
  /* **************************************************************************/

  get hasAuth () { return Object.keys(this.__data__.auth).length !== 0 }
  get authTime () { return this.__data__.auth.date }
  get accessToken () { return this.__data__.auth.access_token }
  get refreshToken () { return this.__data__.auth.refresh_token }
  get authExpiryTime () { return (this.__data__.auth.date || 0) + (this.__data__.auth.expires_in || 0) }

  /* **************************************************************************/
  // Properties : Google Config
  /* **************************************************************************/

  get unreadMode () { return this.__data__.config.unreadMode || UNREAD_MODES.INBOX_UNREAD }
  get unreadQuery () {
    switch (this.unreadMode) {
      case UNREAD_MODES.INBOX: return 'label:inbox'
      case UNREAD_MODES.INBOX_UNREAD: return 'label:inbox label:unread'
      case UNREAD_MODES.PRIMARY_INBOX_UNREAD: return 'label:inbox label:unread category:primary'
      case UNREAD_MODES.INBOX_UNREAD_IMPORTANT: return 'label:inbox label:unread label:important'
    }
  }
  get unreadLabel () {
    switch (this.unreadMode) {
      case UNREAD_MODES.INBOX: return 'INBOX'
      case UNREAD_MODES.INBOX_UNREAD: return 'INBOX'
      case UNREAD_MODES.PRIMARY_INBOX_UNREAD: return 'CATEGORY_PERSONAL' // actually primary
      case UNREAD_MODES.INBOX_UNREAD_IMPORTANT: return 'IMPORTANT'
    }
  }
  get unreadCountIncludesReadMessages () {
    switch (this.unreadMode) {
      case UNREAD_MODES.INBOX: return true
      case UNREAD_MODES.INBOX_UNREAD: return false
      case UNREAD_MODES.PRIMARY_INBOX_UNREAD: return false
      case UNREAD_MODES.INBOX_UNREAD_IMPORTANT: return false
    }
  }

  /* **************************************************************************/
  // Properties : Unread Counts
  /* **************************************************************************/

  get labelUnreadCount () { return this.__data__.unreadCounts.label || -1 }
  get unreadCount () { return this.__data__.unreadCounts.count || 0 }

  /* **************************************************************************/
  // Properties : Messages
  /* **************************************************************************/

  get messages () { return this.__data__.messages }

  /**
  * @param messageId: the id of the message
  * @return true if the model has a message with the given id, false otherwise
  */
  hasMessage (messageId) { return this.messages[messageId] !== undefined }

  /* **************************************************************************/
  // Properties : Unread Messages
  /* **************************************************************************/

  get latestUnreadMessageIds () {
    return this.__data__.unreadMessages.messageIds || []
  }
  get latestUnreadMessages () {
    return this.latestUnreadMessageIds
      .map((messageId) => this.messages[messageId])
      .filter((message) => !!message)
  }
  get unnotifiedMessages () {
    return this.latestUnreadMessages.filter((message) => {
      return parseInt(message.historyId) > this.lastNotifiedHistoryId
    })
  }
  get lastNotifiedHistoryId () {
    return this.__data__.unreadMessages.lastNotifiedHistoryId || 0
  }
}

module.exports = Google
