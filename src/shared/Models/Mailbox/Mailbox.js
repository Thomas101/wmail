const Model = require('../Model')
const uuid = require('uuid')
const Google = require('./Google')

class Mailbox extends Model {

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static provisionId () { return uuid.v4() }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (id, data) {
    super(data)
    this.__id__ = id

    this.__google__ = new Google(
      this.__data__.googleAuth,
      this.__data__.googleConf,
      this.__data__.googleUnreadMessages,
      this.__data__.googleLabelUnread
    )
  }

  /* **************************************************************************/
  // Constants
  /* **************************************************************************/

  static get TYPE_GMAIL () { return 'gmail' }
  static get TYPE_GINBOX () { return 'ginbox' }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get id () { return this.__id__ }
  get type () { return this._value_('type', Mailbox.TYPE_GINBOX) }
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

  get zoomFactor () { return this._value_('zoomFactor', 1.0) }
  get showUnreadBadge () { return this._value_('showUnreadBadge', true) }
  get unreadCountsTowardsAppUnread () { return this._value_('unreadCountsTowardsAppUnread', true) }
  get showNotifications () { return this._value_('showNotifications', true) }

  /* **************************************************************************/
  // Properties : Account Details
  /* **************************************************************************/

  get avatarURL () { return this.__data__.avatar }
  get hasCustomAvatar () { return this.__data__.customAvatar !== undefined }
  get customAvatarId () { return this.__data__.customAvatar }

  get color () {
    if (this.__data__.color) {
      return this.__data__.color
    } else if (this.type === Mailbox.TYPE_GMAIL) {
      return 'rgb(220, 75, 75)'
    } else if (this.type === Mailbox.TYPE_GINBOX) {
      return 'rgb(66, 133, 244)'
    }
  }
  get email () { return this.__data__.email }
  get name () { return this.__data__.name }
  get unread () { return this.__google__.unreadMessageCount }

  /* **************************************************************************/
  // Properties : Auth types
  /* **************************************************************************/

  get google () { return this.__google__ }

  /* **************************************************************************/
  // Properties : Custom injectables
  /* **************************************************************************/

  get customCSS () { return this.__data__.customCSS }
  get hasCustomCSS () { return !!this.customCSS }

  get customJS () { return this.__data__.customJS }
  get hasCustomJS () { return !!this.customJS }
}

module.exports = Mailbox
