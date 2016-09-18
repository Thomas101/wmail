module.exports = (function () {
  'use strict'

  const { ipcRenderer, webFrame } = require('electron')
  const dictionaryLoad = require('./dictionaryLoad')
  const dictionaryExcludes = require('../../../app/shared/dictionaryExcludes')
  const elconsole = require('./elconsole')

  let Nodehun
  try {
    Nodehun = require('../../../app/node_modules/wmail-spellchecker')
  } catch (ex) {
    elconsole.error('Failed to initialize spellchecker', ex)
    throw ex
  }

  const spellcheckers = {
    primary: { nodehun: null, language: null },
    secondary: { nodehun: null, language: null }
  }

  /**
  * Checks if a word is spelt correctly in one spellchecker
  * @param spellchecker: the reference to the spellchecker
  * @param text: the word to check
  * @return true if the work is correct
  */
  const checkSpellcheckerWord = function (spellchecker, text) {
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
  * @return true if there is a primary spellchecker
  */
  const hasPrimarySpellchecker = function () {
    return spellcheckers.primary.nodehun !== null
  }

  /**
  * @return true if there is a secondary spellchecker
  */
  const hasSecondarySpellchecker = function () {
    return spellcheckers.secondary.nodehun !== null
  }

  /**
  * Checks if a word is spelt correctly
  * @param text: the word to check
  * @return true if the work is correct
  */
  const checkWord = function (text) {
    if (hasPrimarySpellchecker() && hasSecondarySpellchecker()) {
      return checkSpellcheckerWord(spellcheckers.primary, text) || checkSpellcheckerWord(spellcheckers.secondary, text)
    } else if (hasPrimarySpellchecker()) {
      return checkSpellcheckerWord(spellcheckers.primary, text)
    } else if (hasSecondarySpellchecker()) {
      return checkSpellcheckerWord(spellcheckers.secondary, text)
    } else {
      return true
    }
  }

  /**
  * Gets a list of spelling suggestions
  * @param text: the text to get suggestions for
  * @return a list of words
  */
  const suggestions = function (text) {
    return {
      primary: hasPrimarySpellchecker() ? {
        language: spellcheckers.primary.language,
        suggestions: spellcheckers.primary.nodehun.spellSuggestionsSync(text)
      } : null,
      secondary: hasSecondarySpellchecker() ? {
        language: spellcheckers.secondary.language,
        suggestions: spellcheckers.secondary.nodehun.spellSuggestionsSync(text)
      } : null
    }
  }

  /**
  * Updates the provider by giving the languages as the primary language
  */
  const updateProvider = function () {
    const language = spellcheckers.primary.language || window.navigator.language
    webFrame.setSpellCheckProvider(language, true, {
      spellCheck: (text) => { return checkWord(text) }
    })
  }

  /**
  * Updates the spellchecker with the correct language
  * @param primaryLanguage: the language to change the spellcheck to
  * @param secondaryLanguage: the secondary language to change the spellcheck to
  */
  const updateSpellchecker = function (primaryLanguage, secondaryLanguage) {
    if (!Nodehun) { return }

    if (spellcheckers.primary.language !== primaryLanguage) {
      if (!primaryLanguage) {
        spellcheckers.primary.language = null
        spellcheckers.primary.nodehun = undefined
      } else {
        spellcheckers.primary.language = primaryLanguage
        dictionaryLoad(primaryLanguage).then((dic) => {
          spellcheckers.primary.nodehun = new Nodehun(dic.aff, dic.dic)
          updateProvider()
        }, (err) => elconsole.error('Failed to load dictionary', err))
      }
    }

    if (spellcheckers.secondary.language !== secondaryLanguage) {
      if (!secondaryLanguage) {
        spellcheckers.secondary.language = null
        spellcheckers.secondary.nodehun = undefined
      } else {
        spellcheckers.secondary.language = secondaryLanguage
        dictionaryLoad(secondaryLanguage).then((dic) => {
          spellcheckers.secondary.nodehun = new Nodehun(dic.aff, dic.dic)
        }, (err) => elconsole.error('Failed to load dictionary', err))
      }
    }
  }

  ipcRenderer.on('start-spellcheck', (evt, data) => {
    updateSpellchecker(data.language, data.secondaryLanguage)
  })

  return {
    hasDictionary: () => { return hasPrimarySpellchecker() || hasSecondarySpellchecker() },
    check: (text) => { return checkWord(text) },
    suggestions: (text) => { return suggestions(text) }
  }
})()
