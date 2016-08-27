const Model = require('../Model')
const path = require('path')

class LanguageSettings extends Model {

  /* ****************************************************************************/
  // Class
  /* ****************************************************************************/

  /**
  * @param root: the root directory of the app
  * @return the paths to {add, dic}
  */
  static customDictionaryPaths (root) {
    return {
      aff: path.join(root, 'dictionary/custom.aff'),
      dic: path.join(root, 'dictionary/custom.dic')
    }
  }

  static get defaultSpellcheckerLanguage () { return 'en_US' }

  /* ****************************************************************************/
  // Properties: Spellchecker
  /* ****************************************************************************/

  get spellcheckerEnabled () { return this._value_('spellcheckerEnabled', true) }
  get defaultSpellcheckerLanguage () { return 'en_US' }
  get spellcheckerLanguage () { return this._value_('customSpellcheckerLanguage', this.defaultSpellcheckerLanguage) }
  get customSpellcheckerLanguage () {
    const lang = this._value_('customSpellcheckerLanguage', undefined)
    return lang === this.defaultSpellcheckerLanguage ? undefined : lang
  }
  get hasCustomSpellcheckerLanguage () { return this.customSpellcheckerLanguage === undefined }

}

module.exports = LanguageSettings
