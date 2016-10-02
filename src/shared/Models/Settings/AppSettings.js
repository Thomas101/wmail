const Model = require('../Model')

class AppSettings extends Model {
  get ignoreGPUBlacklist () { return this._value_('ignoreGPUBlacklist', false) }
  get checkForUpdates () { return this._value_('checkForUpdates', true) }
}

module.exports = AppSettings
