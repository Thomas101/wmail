const MailboxService = require('../MailboxService')
const { GMAIL_NOTIFICATION_MAX_MESSAGE_AGE_MS } = require('../../../constants')

const UNREAD_MODES = {
  INBOX: 'inbox',
  INBOX_UNREAD: 'inbox_unread',
  PRIMARY_INBOX_UNREAD: 'primary_inbox_unread'
}

class GoogleMailboxService extends MailboxService {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get UNREAD_MODES () { return UNREAD_MODES }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (id, data) {
    super(id, data)
    this.__gdata__ = data.google || {}
    this.__auth__ = this.__gdata__.auth || {}
    this.__config__ = this.__gdata__.config || {}
    this.__unread__ = this.__gdata__.unread || {}
  }

  /* **************************************************************************/
  // Properties : GoogleAuth
  /* **************************************************************************/

  get hasAuth () { return Object.keys(this.__auth__).length !== 0 }
  get authTime () { return this.__auth__.date }
  get accessToken () { return this.__auth__.access_token }
  get refreshToken () { return this.__auth__.refresh_token }
  get authExpiryTime () { return (this.__auth__.date || 0) + (this.__auth__.expires_in || 0) }

  /* **************************************************************************/
  // Properties : Google Config
  /* **************************************************************************/

  get unreadMode () { return this.__config__.unreadMode || UNREAD_MODES.INBOX_UNREAD }
  get unreadQuery () {
    switch (this.unreadMode) {
      case UNREAD_MODES.INBOX: return 'label:inbox'
      case UNREAD_MODES.INBOX_UNREAD: return 'label:inbox label:unread'
      case UNREAD_MODES.PRIMARY_INBOX_UNREAD: return 'label:inbox label:unread category:primary'
    }
  }
  get unreadLabel () {
    switch (this.unreadMode) {
      case UNREAD_MODES.INBOX: return 'INBOX'
      case UNREAD_MODES.INBOX_UNREAD: return 'INBOX'
      case UNREAD_MODES.PRIMARY_INBOX_UNREAD: return 'CATEGORY_PERSONAL' // actually primary
    }
  }
  get unreadLabelField () {
    switch (this.unreadMode) {
      case UNREAD_MODES.INBOX: return 'threadsTotal'
      case UNREAD_MODES.INBOX_UNREAD: return 'threadsUnread'
      case UNREAD_MODES.PRIMARY_INBOX_UNREAD: return 'threadsUnread'
    }
  }

  /* **************************************************************************/
  // Properties : Google Unread
  /* **************************************************************************/

  get unreadMessages () {
    return Object.keys(this.__unread__)
      .reduce((acc, k) => {
        if (this.__unread__[k].unread) {
          acc[k] = this.__unread__[k]
        }
        return acc
      }, {})
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

module.exports = GoogleMailboxService
