const alt = require('../alt')
const actions = require('./spellcheckDictionaryActions')

class SpellcheckChangeStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.changeId = 0
    this.changeTo = undefined

    /* ****************************************/
    // Changing
    /* ****************************************/

    /**
    * @return true if the dictionary is changing
    */
    this.isChangingDictionary = () => { return this.changeTo !== undefined }

    /**
    * @return the unique id for the dictionary
    */
    this.changingDictionaryId = () => { return this.changeId }

    /**
    * @return the language trying to change to
    */
    this.changingDictionaryLang = () => { return this.changeTo }

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      handleStartDictionaryChange: actions.START_DICTIONARY_CHANGE,
      handleFinishDictionaryChange: actions.FINISH_DICTIONARY_CHANGE,
      handleInstallDictionary: actions.INSTALL_DICTIONARY
    })
  }

  /* **************************************************************************/
  // Handlers: Changing Dict
  /* **************************************************************************/

  handleStartDictionaryChange ({ id, lang }) {
    this.changeId = id
    this.changeTo = lang
  }

  handleFinishDictionaryChange () {
    this.changeId = 0
    this.changeTo = undefined
  }

  handleInstallDictionary () {

  }
}

module.exports = alt.createStore(SpellcheckChangeStore, 'SpellcheckChangeStore')
