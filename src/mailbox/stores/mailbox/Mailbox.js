const uuid = require('shared/uuid')
const Google = require('./Google')

class Mailbox {

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static provisionId () { return uuid.uuid4() }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (id, data) {
    this.__id__ = id
    this.__data__ = data

    this.__google__ = new Google(this.__data__.googleAuth, this.__data__.googleConf, this.__data__.googleUnread)
  }

  /**
  * Clones a copy of the data
  * @return a new copy of the data copied deeply.
  */
  cloneData () {
    return JSON.parse(JSON.stringify(this.__data__))
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
  get showNotifications () { return this.__data__.showNotifications === undefined ? true : this.__data__.showNotifications }

  /* **************************************************************************/
  // Properties : Account Details
  /* **************************************************************************/

  get avatar () { return this.__data__.avatar }
  get email () { return this.__data__.email }
  get name () { return this.__data__.name }
  get unread () { return this.__data__.unread }

  /* **************************************************************************/
  // Properties : Auth types
  /* **************************************************************************/

  get google () { return this.__google__ }
}

module.exports = Mailbox
