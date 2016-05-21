const Model = require('../Model')

class UISettings extends Model {
  get showTitlebar () { return this._value_('showTitlebar', false) }
  get showAppBadge () { return this._value_('showAppBadge', true) }
  get showAppMenu () { return this._value_('showAppMenu', process.platform !== 'win32') }
  get sidebarEnabled () { return this._value_('sidebarEnabled', true) }
}

module.exports = UISettings
