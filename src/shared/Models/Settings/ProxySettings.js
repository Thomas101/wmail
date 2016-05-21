const Model = require('../Model')

class ProxySettings extends Model {
  get enabled () { return this._value_('enabled', false) }
  get host () { return this.__data__.host }
  get port () { return this.__data__.port }
  get url () { return this.host + ':' + this.port }
}

module.exports = ProxySettings
