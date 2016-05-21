const Model = require('../Model')
const uuid = require('uuid')
const GInboxMailboxService = require('./Services/GInboxMailboxService')
const GMailMailboxService = require('./Services/GMailMailboxService')

class Mailbox extends Model {

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static provisionId () { return uuid.v4() }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param id: the mailbox id
  * @param data: the mailbox data
  * @param avatarFetchFn: function to fetch the avatar if needed
  */
  constructor (id, data, avatarFetchFn) {
    super(data)
    this.__id__ = id
    this.__avatarFetchFn__ = avatarFetchFn

    switch (data.service) {
      case GInboxMailboxService.service:
        this.__service__ = new GInboxMailboxService(id, data)
        break
      case GMailMailboxService.service:
        this.__service__ = new GMailMailboxService(id, data)
        break
    }
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get id () { return this.__id__ }
  get service () { return this.__service__ }

  /* **************************************************************************/
  // Properties : Account Details
  /* **************************************************************************/

  get email () { return this.__data__.email }
  get name () { return this.__data__.name }
  get avatar () { return this.__data__.avatar }
  get hasCustomAvatar () { return this.__data__.customAvatar !== undefined }
  get customAvatar () {
    if (this.__data__.customAvatar) {
      return this.__avatarFetchFn__(this.__data__.customAvatar)
    } else {
      return undefined
    }
  }
  get color () { return this._value_('color', this.__service__.brandColor) }

  /* **************************************************************************/
  // Properties : Settings
  /* **************************************************************************/

  get zoomFactor () { return this._value_('zoomFactor', 1.0) }
  get showUnreadBadge () { return this._value_('showUnreadBadge', true) }
  get unreadCountsTowardsAppUnread () { return this._value_('unreadCountsTowardsAppUnread', true) }
  get showNotifications () { return this._value_('showNotifications', true) }
}

module.exports = Mailbox
