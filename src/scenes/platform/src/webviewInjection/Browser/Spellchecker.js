const { webFrame, ipcRenderer } = require('electron')
const DictionaryLoad = require('./DictionaryLoad')
const dictionaryExcludes = require('../../../../app/shared/dictionaryExcludes')
const elconsole = require('../elconsole')

let Nodehun
try {
  Nodehun = require('../../../../app/node_modules/wmail-spellchecker')
} catch (ex) {
  elconsole.error('Failed to initialize spellchecker', ex)
  throw ex
}

class Spellchecker {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this._spellcheckers_ = {
      primary: { nodehun: null, language: null },
      secondary: { nodehun: null, language: null }
    }

    ipcRenderer.on('start-spellcheck', (evt, data) => {
      this.updateSpellchecker(data.language, data.secondaryLanguage)
    })
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get hasPrimarySpellchecker () { return this._spellcheckers_.primary.nodehun !== null }
  get hasSecondarySpellchecker () { return this._spellcheckers_.secondary.nodehun !== null }
  get hasSpellchecker () { return this.hasPrimarySpellchecker || this.hasSecondarySpellchecker }

  /* **************************************************************************/
  // Checking & Suggestions
  /* **************************************************************************/

  /**
  * Checks if a word is spelt correctly in one spellchecker
  * @param spellchecker: the reference to the spellchecker
  * @param text: the word to check
  * @return true if the work is correct
  */
  checkSpellcheckerWord (spellchecker, text) {
    if (spellchecker.language) {
      if (dictionaryExcludes[spellchecker.language] && dictionaryExcludes[spellchecker.language].has(text)) {
        return true
      } else {
        return spellchecker.nodehun.isCorrectSync(text)
      }
    } else {
      return true
    }
  }

  /**
  * Checks if a word is spelt correctly
  * @param text: the word to check
  * @return true if the work is correct
  */
  checkWord (text) {
    if (this.hasPrimarySpellchecker && this.hasSecondarySpellchecker) {
      return this.checkSpellcheckerWord(this._spellcheckers_.primary, text) ||
                this.checkSpellcheckerWord(this._spellcheckers_.secondary, text)
    } else if (this.hasPrimarySpellchecker) {
      return this.checkSpellcheckerWord(this._spellcheckers_.primary, text)
    } else if (this.hasSecondarySpellchecker) {
      return this.checkSpellcheckerWord(this._spellcheckers_.secondary, text)
    } else {
      return true
    }
  }

  /**
  * Gets a list of spelling suggestions
  * @param text: the text to get suggestions for
  * @return a list of words
  */
  suggestions (text) {
    return {
      primary: this.hasPrimarySpellchecker ? {
        language: this._spellcheckers_.primary.language,
        suggestions: this._spellcheckers_.primary.nodehun.spellSuggestionsSync(text)
      } : null,
      secondary: this.hasSecondarySpellchecker ? {
        language: this._spellcheckers_.secondary.language,
        suggestions: this._spellcheckers_.secondary.nodehun.spellSuggestionsSync(text)
      } : null
    }
  }

  /* **************************************************************************/
  // Updating spellchecker
  /* **************************************************************************/

  /**
  * Updates the provider by giving the languages as the primary language
  */
  updateProvider () {
    const language = this._spellcheckers_.primary.language || window.navigator.language
    webFrame.setSpellCheckProvider(language, true, {
      spellCheck: (text) => { return this.checkWord(text) }
    })
  }

  /**
  * Updates the spellchecker with the correct language
  * @param primaryLanguage: the language to change the spellcheck to
  * @param secondaryLanguage: the secondary language to change the spellcheck to
  */
  updateSpellchecker (primaryLanguage, secondaryLanguage) {
    if (!Nodehun) { return }

    if (this._spellcheckers_.primary.language !== primaryLanguage) {
      if (!primaryLanguage) {
        this._spellcheckers_.primary.language = null
        this._spellcheckers_.primary.nodehun = undefined
      } else {
        this._spellcheckers_.primary.language = primaryLanguage
        DictionaryLoad.load(primaryLanguage).then((dic) => {
          this._spellcheckers_.primary.nodehun = new Nodehun(dic.aff, dic.dic)
          this.updateProvider()
        }, (err) => elconsole.error('Failed to load dictionary', err))
      }
    }

    if (this._spellcheckers_.secondary.language !== secondaryLanguage) {
      if (!secondaryLanguage) {
        this._spellcheckers_.secondary.language = null
        this._spellcheckers_.secondary.nodehun = undefined
      } else {
        this._spellcheckers_.secondary.language = secondaryLanguage
        DictionaryLoad.load(secondaryLanguage).then((dic) => {
          this._spellcheckers_.secondary.nodehun = new Nodehun(dic.aff, dic.dic)
        }, (err) => elconsole.error('Failed to load dictionary', err))
      }
    }
  }
}

module.exports = Spellchecker
