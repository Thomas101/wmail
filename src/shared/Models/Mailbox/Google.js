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

  constructor (auth, config, labelInfo, unreadMessageInfo) {
    super({
      auth: auth || {},
      config: config || {},
      labelInfo: labelInfo,
      unreadMessages: unreadMessageInfo || {}
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
  // Properties : Label info
  /* **************************************************************************/

  get labelInfo () { return this.__data__.labelInfo || {} }
  get messagesTotal () { return this.labelInfo.messagesTotal || 0 }
  get messagesUnread () { return this.labelInfo.messagesUnread || 0 }
  get threadsTotal () { return this.labelInfo.threadsTotal || 0 }
  get threadsUnread () { return this.labelInfo.threadsUnread || 0 }
  get unreadCount () {
    return this.unreadCountIncludesReadMessages ? this.threadsTotal : this.threadsUnread
  }

  /* **************************************************************************/
  // Properties : Unread Messages
  /* **************************************************************************/

  get latestUnreadThreads () {
    return this.__data__.unreadMessages.latestUnreadThreads || []
  }

  get latestUnreadMessages () {
    return this.latestUnreadThreads.map((thread) => {
      const messages = thread.messages || []
      for (var i = messages.length - 1; i >= 0; i--) {
        const message = messages[i]
        const wasSent = (message.labelIds || []).findIndex((label) => label === 'SENT') !== -1
        if (!wasSent) { return message }
      }
      return undefined
    }).filter((m) => !!m)
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
