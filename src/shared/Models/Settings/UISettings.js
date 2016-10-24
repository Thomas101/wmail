const Model = require('../Model')

class UISettings extends Model {
  get showTitlebar () { return this._value_('showTitlebar', false) }
  get showAppBadge () { return this._value_('showAppBadge', true) }
  get showTitlebarCount () { return this._value_('showTitlebarCount', true) }
  get showAppMenu () { return this._value_('showAppMenu', process.platform !== 'win32') }
  get sidebarEnabled () { return this._value_('sidebarEnabled', true) }
  get openHidden () { return this._value_('openHidden', false) }
}

module.exports = UISettings
