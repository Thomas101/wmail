const Model = require('../Model')
const uuid = require('uuid')
const Google = require('./Google')
const SERVICES = require('./MailboxServices')
const TYPES = require('./MailboxTypes')

class Mailbox extends Model {

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static provisionId () { return uuid.v4() }
  static get TYPES () { return Object.assign({}, TYPES) }
  static get SERVICES () { return Object.assign({}, SERVICES) }

  static get TYPE_GMAIL () { return TYPES.GMAIL }
  static get TYPE_GINBOX () { return TYPES.GINBOX }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (id, data) {
    super(data)
    this.__id__ = id

    this.__google__ = new Google(
      this.__data__.googleAuth,
      this.__data__.googleConf,
      this.__data__.googleLabelInfo_v2,
      this.__data__.googleUnreadMessageInfo_v2
    )
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get id () { return this.__id__ }
  get type () { return this._value_('type', Mailbox.TYPE_GINBOX) }

  /* **************************************************************************/
  // Properties: Constants
  /* **************************************************************************/

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
  // Properties : Services
  /* **************************************************************************/

  get supportedServices () {
    switch (this.type) {
      case Mailbox.TYPE_GINBOX:
      case Mailbox.TYPE_GMAIL:
        return Google.SUPPORTED_SERVICES
      default:
        return []
    }
  }
  get defaultServices () {
    switch (this.type) {
      case Mailbox.TYPE_GINBOX:
      case Mailbox.TYPE_GMAIL:
        return Google.DEFAULT_SERVICES
      default:
        return []
    }
  }
  get enabledServies () { return this._value_('services', this.defaultServices) }
  get hasEnabledServices () { return this.enabledServies.length !== 0 }

  /**
  * Resolves the url for a service
  * @param service: the type of service to resolve for
  * @return the url for the service or undefined
  */
  resolveServiceUrl (service) {
    if (service === SERVICES.DEFAULT) {
      return this.url
    } else {
      switch (this.type) {
        case Mailbox.TYPE_GINBOX:
        case Mailbox.TYPE_GMAIL:
          return Google.SERVICE_URLS[service]
        default:
          return undefined
      }
    }
  }

  /**
  * Resolves the human name for a service
  * @param service: the type of service to resolve for
  * @return the url for the service or undefined
  */
  resolveServiceName (service) {
    if (service === SERVICES.DEFAULT) {
      return this.typeName
    } else {
      switch (this.type) {
        case Mailbox.TYPE_GINBOX:
        case Mailbox.TYPE_GMAIL:
          return Google.SERVICE_NAMES[service]
        default:
          return undefined
      }
    }
  }

  /* **************************************************************************/
  // Properties : Options
  /* **************************************************************************/

  get zoomFactor () { return this._value_('zoomFactor', 1.0) }
  get showUnreadBadge () { return this._value_('showUnreadBadge', true) }
  get unreadCountsTowardsAppUnread () { return this._value_('unreadCountsTowardsAppUnread', true) }
  get showNotifications () { return this._value_('showNotifications', true) }
  get artificiallyPersistCookies () { return this._value_('artificiallyPersistCookies', false) }

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
  get unread () { return this.__google__.unreadCount }

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
