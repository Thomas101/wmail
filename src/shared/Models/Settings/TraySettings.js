const Model = require('../Model')

class TraySettings extends Model {
  get show () { return this._value_('show', true) }
  get showUnreadCount () { return this._value_('showUnreadCount', true) }
  get readColor () { return this._value_('readColor', '#000000') }
  get isReadColorDefault () { return !!this._value_.readColor }
  get unreadColor () { return this._value_('unreadColor', '#C82018') }
}

module.exports = TraySettings
