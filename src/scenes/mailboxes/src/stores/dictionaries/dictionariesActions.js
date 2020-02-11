const alt = require('../alt')
const uuid = require('uuid')

class DictionariesActions {

  /* **************************************************************************/
  // Changing
  /* **************************************************************************/

  /**
  * Starts the dictionary process
  * @return { id }
  */
  startDictionaryInstall () {
    return { id: uuid.v4() }
  }

  /**
  * Finishes / cancels the dictionary change
  */
  stopDictionaryInstall () {
    return { }
  }

  /**
  * Starts the dictionary process
  * @param id: the change id for validation
  * @param lang: the lang code to change to
  */
  pickDictionaryInstallLanguage (id, lang) {
    return { id: id, lang: lang }
  }

  /**
  * Starts the dictionary install
  * @param id: the change id for validation
  */
  installDictionary (id) {
    return { id: id }
  }
}

module.exports = alt.createActions(DictionariesActions)
