const uuid = require('shared/uuid')

class Mailbox {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (id, data) {
    this.__id__ = id
    this.__data__ = data
  }

  static provisionId () { return uuid.uuid4() }

  /* **************************************************************************/
  // Constants
  /* **************************************************************************/

  static get TYPE_GMAIL () { return 'gmail' }
  static get TYPE_GINBOX () { return 'ginbox' }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get id () { return this.__id__ }
  get type () { return this.__data__.type || Mailbox.TYPE_GINBOX }
  get typeName () {
    switch (this.type) {
      case Mailbox.TYPE_GINBOX: return 'Google Inbox'
      case Mailbox.TYPE_GMAIL: return 'Gmail'
      default: return undefined
    }
  }
  get url () {
    switch (this.type) {
      case Mailbox.TYPE_GINBOX: return 'https://inbox.google.com'
      case Mailbox.TYPE_GMAIL: return 'https://mail.google.com?ibxr=0'
      default: return undefined
    }
  }

  /* **************************************************************************/
  // Properties : Options
  /* **************************************************************************/

  get zoomFactor () { return this.__data__.zoomFactor === undefined ? 1.0 : this.__data__.zoomFactor }
  get showUnreadBadge () { return this.__data__.showUnreadBadge === undefined ? true : this.__data__.showUnreadBadge }

  /* **************************************************************************/
  // Properties : Account Details
  /* **************************************************************************/

  get avatar () { return this.__data__.avatar }
  get email () { return this.__data__.email }
  get name () { return this.__data__.name }
  get unread () { return this.__data__.unread }

  /* **************************************************************************/
  // Properties : GoogleAuth
  /* **************************************************************************/

  get googleAuth () { return this.__data__.googleAuth }
  get googleAuthTime () { return (this.googleAuth || {}).date }
  get hasGoogleAuth () { return this.googleAuth !== undefined }
  get googleAccessToken () { return (this.googleAuth || {}).access_token }
  get googleRefreshToken () { return (this.googleAuth || {}).refresh_token }
  get googleAuthExpiryTime () { return ((this.googleAuth || {}).date || 0) + ((this.googleAuth || {}).expires_in || 0) }

  /* **************************************************************************/
  // Properties : Google Config
  /* **************************************************************************/

  static get GOOGLE_UNREAD_QUERY () { return 'label:inbox label:unread' }
  static get GOOGLE_PRIMARY_UNREAD_QUERY () { return 'label:inbox label:unread category:primary' }

  get googleConf () { return this.__data__.googleConf || {} }
  get googleUnreadQuery () { return this.googleConf.unreadQuery || Mailbox.GOOGLE_UNREAD_QUERY }
}

module.exports = Mailbox
