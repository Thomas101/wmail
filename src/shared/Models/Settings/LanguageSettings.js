const Model = require('../Model')
const path = require('path')

class LanguageSettings extends Model {

  /* ****************************************************************************/
  // Class
  /* ****************************************************************************/

  /**
  * @param root: the root directory of the app
  * @return the paths to add user dictionaries
  */
  static userDictionariesPath (root) { return path.join(root, 'user_dictionaries') }
  static get defaultSpellcheckerLanguage () { return 'en_US' }

  /* ****************************************************************************/
  // Properties: Spellchecker
  /* ****************************************************************************/

  get spellcheckerEnabled () { return this._value_('spellcheckerEnabled', true) }
  get spellcheckerLanguage () { return this._value_('spellcheckerLanguage', LanguageSettings.defaultSpellcheckerLanguage) }

}

module.exports = LanguageSettings
