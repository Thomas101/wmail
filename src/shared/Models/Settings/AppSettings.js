const Model = require('../Model')

class AppSettings extends Model {
  get ignoreGPUBlacklist () { return this._value_('ignoreGPUBlacklist', false) }
  get artificiallyPersistCookies () { return this._value_('artificiallyPersistCookies', false) }
}

module.exports = AppSettings
