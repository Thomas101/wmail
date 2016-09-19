const Model = require('../Model')

class AppSettings extends Model {
  get ignoreGPUBlacklist () { return this._value_('ignoreGPUBlacklist', false) }
}

module.exports = AppSettings
