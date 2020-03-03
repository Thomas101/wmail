const Model = require('../Model')
const constants = require('../../../shared/constants')

class TraySettings extends Model {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param data: the tray data
  * @param themedDefaults: the default values for the tray
  */
  constructor (data, themedDefaults = {}) {
    super(data)
    this.__themedDefaults__ = Object.freeze(Object.assign({}, themedDefaults))
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get show () { return this._value_('show', true) }
  get showUnreadCount () { return this._value_('showUnreadCount', true) }
  get mouseTrigger () { return this._value_('mouseTrigger', constants.MOUSE_TRIGGERS.SINGLE) }
  get mouseTriggerAction () { return this._value_('mouseTriggerAction', constants.MOUSE_TRIGGER_ACTIONS.TOGGLE) }
  get hideWhenMinimized () { return this._value_('hideWhenMinimized', false) }
  get hideWhenClosed () { return this._value_('hideWhenClosed', true) }
  get readColor () { return this._value_('readColor', this.__themedDefaults__.readColor) }
  get readBackgroundColor () { return this._value_('readBackgroundColor', this.__themedDefaults__.readBackgroundColor) }
  get unreadColor () { return this._value_('unreadColor', this.__themedDefaults__.unreadColor) }
  get unreadBackgroundColor () { return this._value_('unreadBackgroundColor', this.__themedDefaults__.unreadBackgroundColor) }

  get dpiMultiplier () {
    let defaultValue = 1
    try {
      defaultValue = window.devicePixelRatio
    } catch (ex) { }
    return this._value_('dpiMultiplier', defaultValue)
  }
}

module.exports = TraySettings
