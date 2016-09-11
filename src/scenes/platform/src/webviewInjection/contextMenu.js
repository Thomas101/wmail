;(function () {
  'use strict'

  const { remote, ipcRenderer } = require('electron')
  const { shell, clipboard, Menu } = remote
  const dictInfo = require('../../../app/shared/remoteDictionaries.json')

  let spellchecker
  const textOnlyRE = new RegExp(/[^a-z]+/gi)

  /**
  * @param evt: the event that triggered
  * @return true if the target is in a text editor
  */
  const isTexteditorTarget = function (evt) {
    if (evt.target.tagName === 'INPUT' || evt.target.tagName === 'TEXTAREA') { return true }
    if (evt.path.findIndex((e) => e.getAttribute && e.getAttribute('contentEditable') === 'true') !== -1) { return true }
    return false
  }

  /**
  * @param evt: the event that triggered
  * @return the url if the event is in a link false otherwise
  */
  const isLinkTarget = function (evt) {
    if (evt.target.tagName === 'A') { return evt.target.getAttribute('href') }
    const parentLink = evt.path.find((e) => e.tagName === 'A')
    if (parentLink) {
      return parentLink.getAttribute('href')
    }
    return false
  }

  /**
  * Renders menu items for spelling suggestions
  * @param suggestions: a list of text suggestions
  * @param textSelection: the current text selection
  * @return a list of menu items
  */
  const renderSuggestionMenuItems = function (suggestions, textSelection) {
    const menuItems = []
    if (suggestions.length) {
      suggestions.forEach((suggestion) => {
        menuItems.push({
          label: suggestion,
          click: () => {
            const range = textSelection.getRangeAt(0)
            range.deleteContents()
            range.insertNode(document.createTextNode(suggestion))
          }
        })
      })
    } else {
      menuItems.push({ label: 'No Spelling Suggestions', enabled: false })
    }
    return menuItems
  }

  document.addEventListener('contextmenu', (evt) => {
    const selection = window.getSelection()
    const textSelection = selection.toString().trim()
    const menuTemplate = []

    // Spell check suggestions
    if (spellchecker && spellchecker.hasDictionary()) {
      if (isTexteditorTarget(evt)) {
        if (textOnlyRE.exec(textSelection) === null) {
          if (!spellchecker.check(textSelection)) {
            const suggestions = spellchecker.suggestions(textSelection)
            if (suggestions.primary && suggestions.secondary) {
              menuTemplate.push({
                label: (dictInfo[suggestions.primary.language] || {}).name || suggestions.primary.language,
                submenu: renderSuggestionMenuItems(suggestions.primary.suggestions, selection)
              })
              menuTemplate.push({
                label: (dictInfo[suggestions.secondary.language] || {}).name || suggestions.secondary.language,
                submenu: renderSuggestionMenuItems(suggestions.secondary.suggestions, selection)
              })
            } else {
              const suggList = (suggestions.primary.suggestions || suggestions.secondary.suggestions || [])
              renderSuggestionMenuItems(suggList, selection).forEach((item) => menuTemplate.push(item))
            }
            menuTemplate.push({ type: 'separator' })
          }
        }
      }
    }

    // Link
    const linkTarget = isLinkTarget(evt)
    if (linkTarget && linkTarget.indexOf('://') !== -1) {
      menuTemplate.push({
        label: 'Open Link',
        click: () => {
          shell.openExternal(linkTarget)
        }
      })
      if (process.platform === 'darwin') {
        menuTemplate.push({
          label: 'Open Link in Background',
          click: () => {
            shell.openExternal(linkTarget, { activate: false })
          }
        })
      }
      menuTemplate.push({
        label: 'Copy link Address',
        click: () => {
          clipboard.writeText(linkTarget)
        }
      })
      menuTemplate.push({ type: 'separator' })
    }

    // Undo / redo
    menuTemplate.push({ label: 'Undo', role: 'undo' })
    menuTemplate.push({ label: 'Redo', role: 'redo' })
    menuTemplate.push({ type: 'separator' })

    // Text editor / text selection
    if (isTexteditorTarget(evt)) {
      menuTemplate.push({ label: 'Cut', role: 'cut' })
      menuTemplate.push({ label: 'Copy', role: 'copy' })
      menuTemplate.push({ label: 'Paste', role: 'paste' })
      menuTemplate.push({ label: 'Paste and match style', role: 'pasteandmatchstyle' })
      menuTemplate.push({ type: 'separator' })
    } else if (textSelection) {
      menuTemplate.push({ label: 'Copy', role: 'copy' })
      menuTemplate.push({ type: 'separator' })
    }

    menuTemplate.push({ label: 'Select all', role: 'selectall' })
    menuTemplate.push({ type: 'separator' })
    menuTemplate.push({
      label: 'WMail Settings',
      click: () => {
        ipcRenderer.sendToHost({ type: 'open-settings' })
      }
    })
    const menu = Menu.buildFromTemplate(menuTemplate)
    menu.popup(remote.getCurrentWindow())
  }, false)

  module.exports = {
    setSpellchecker: (sc) => {
      spellchecker = sc
    }
  }
})()
