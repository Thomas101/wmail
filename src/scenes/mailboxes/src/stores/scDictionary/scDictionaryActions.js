const alt = require('../alt')
const uuid = require('uuid')

class SCDictionaryActions {

  /* **************************************************************************/
  // Changing
  /* **************************************************************************/

  /**
  * Starts changing the dictionary
  * @param lang: the language of the dictionary to change to
  */
  startDictionaryChange (lang) {
    return { lang: lang, id: uuid.v4() }
  }

  /**
  * Finishes the dictionary change
  */
  finishDictionaryChange () {
    return {}
  }

  /* **************************************************************************/
  // Remote Assets
  /* **************************************************************************/

  /**
  * Fetches and installs the current dictionary
  */
  installDictionary () {
    return {}
  }
}

module.exports = alt.createActions(SCDictionaryActions)
