const Model = require('../Model')

class TraySettings extends Model {
  get show () { return this._value_('show', true) }
  get showUnreadCount () { return this._value_('showUnreadCount', true) }
  get readColor () { return this._value_('readColor', '#000000') }
  get readBackgroundColor () { return this._value_('readBackgroundColor', 'transparent') }
  get isReadColorDefault () { return !this._value_('readColor', undefined) }
  get unreadColor () { return this._value_('unreadColor', '#C82018') }
  get unreadBackgroundColor () { return this._value_('unreadBackgroundColor', 'transparent') }
}

module.exports = TraySettings
