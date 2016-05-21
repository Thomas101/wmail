const Model = require('../Model')

class LanguageSettings extends Model {
  get spellcheckerEnabled () { return this._value_('spellcheckerEnabled', true) }
}

module.exports = LanguageSettings
