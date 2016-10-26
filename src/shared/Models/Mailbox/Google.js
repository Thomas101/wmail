const Model = require('../Model')
const { GMAIL_NOTIFICATION_MAX_MESSAGE_AGE_MS } = require('../../constants')

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

  constructor (auth, config, unread, labelUnread) {
    super({
      auth: auth || {},
      config: config || {},
      unread: unread || {},
      labelUnread: labelUnread || {}
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
  get unreadLabelField () {
    return this.unreadCountIncludesReadMessages ? 'threadsTotal' : 'threadsUnread'
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
  // Properties : Google Unread
  /* **************************************************************************/

  get labelUnreadCount () { return this.__data__.labelUnread.count || -1 }

  get unreadMessages () {
    return Object.keys(this.__data__.unread)
      .reduce((acc, k) => {
        if (this.__data__.unread[k].unread) {
          acc[k] = this.__data__.unread[k]
        }
        return acc
      }, {})
  }

  get unreadMessageCount () {
    // Make sure messages are reduced by their thread too
    return Object.keys(this.__data__.unread)
      .reduce((acc, messageId) => {
        const rec = this.__data__.unread[messageId]
        if ((this.unreadCountIncludesReadMessages || rec.unread) && rec.message) {
          return acc.add(rec.message.threadId)
        } else {
          return acc
        }
      }, new Set()).size
  }

  get unreadUnotifiedMessages () {
    const unotified = {}
    const unread = this.unreadMessages
    const now = new Date().getTime()

    for (var k in unread) {
      const info = unread[k]
      if (info.notified === undefined && info.message) {
        const messageDate = new Date(parseInt(info.message.internalDate, 10)).getTime()
        if (now - messageDate < GMAIL_NOTIFICATION_MAX_MESSAGE_AGE_MS) {
          unotified[k] = info
        }
      }
    }
    return unotified
  }
}

module.exports = Google
