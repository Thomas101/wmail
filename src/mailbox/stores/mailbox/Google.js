class Google {

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get INBOX_QUERY () { return 'label:inbox' }
  static get UNREAD_QUERY () { return 'label:inbox label:unread' }
  static get PRIMARY_UNREAD_QUERY () { return 'label:inbox label:unread category:primary' }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (auth, config, unread) {
    this.__auth__ = auth
    this.__config__ = config
    this.__unread__ = unread
  }

  /* **************************************************************************/
  // Properties : GoogleAuth
  /* **************************************************************************/

  get hasAuth () { return this.__auth__ !== undefined }
  get authTime () { return (this.__auth__ || {}).date }
  get accessToken () { return (this.__auth__ || {}).access_token }
  get refreshToken () { return (this.__auth__ || {}).refresh_token }
  get authExpiryTime () { return ((this.__auth__ || {}).date || 0) + ((this.__auth__ || {}).expires_in || 0) }

  /* **************************************************************************/
  // Properties : Google Config
  /* **************************************************************************/

  get unreadQuery () { return (this.__config__ || {}).unreadQuery || Google.UNREAD_QUERY }

  /* **************************************************************************/
  // Properties : Google Unread
  /* **************************************************************************/

  get unotifiedUnread () {
    return Object.keys(this.__unread__ || {})
    .map(threadId => this.__unread__[threadId])
    .filter(thread => {
      if (!thread.lastNotified) { return true }
      if (thread.lastNotified.historyId !== thread.historyId) { return true }
      return false
    })
    .sort((a, b) => parseInt(a.historyId, 10) - parseInt(b.historyId, 10))
  }
}

module.exports = Google
