;(function () {
  'use strict'

  const { remote, ipcRenderer } = require('electron')
  const { shell, clipboard, Menu } = remote
  const webContents = remote.getCurrentWebContents()
  const dictInfo = require('../../../app/shared/dictionaries.js')

  let spellchecker

  /**
  * Renders menu items for spelling suggestions
  * @param suggestions: a list of text suggestions
  * @return a list of menu items
  */
  const renderSuggestionMenuItems = function (suggestions) {
    const menuItems = []
    if (suggestions.length) {
      suggestions.forEach((suggestion) => {
        menuItems.push({
          label: suggestion,
          click: () => { webContents.replaceMisspelling(suggestion) }
        })
      })
    } else {
      menuItems.push({ label: 'No Spelling Suggestions', enabled: false })
    }
    return menuItems
  }

  webContents.removeAllListeners('context-menu') // Failure to do this will cause an error on reload
  webContents.on('context-menu', (evt, params) => {
    const menuTemplate = []

    // Spelling suggestions
    if (params.isEditable && params.misspelledWord && spellchecker && spellchecker.hasDictionary()) {
      const suggestions = spellchecker.suggestions(params.misspelledWord)
      if (suggestions.primary && suggestions.secondary) {
        menuTemplate.push({
          label: (dictInfo[suggestions.primary.language] || {}).name || suggestions.primary.language,
          submenu: renderSuggestionMenuItems(suggestions.primary.suggestions)
        })
        menuTemplate.push({
          label: (dictInfo[suggestions.secondary.language] || {}).name || suggestions.secondary.language,
          submenu: renderSuggestionMenuItems(suggestions.secondary.suggestions)
        })
      } else {
        const suggList = (suggestions.primary.suggestions || suggestions.secondary.suggestions || [])
        renderSuggestionMenuItems(suggList).forEach((item) => menuTemplate.push(item))
      }
      menuTemplate.push({ type: 'separator' })
    }

    // URLS
    if (params.linkURL) {
      menuTemplate.push({
        label: 'Open Link',
        click: () => { shell.openExternal(params.linkURL) }
      })
      if (process.platform === 'darwin') {
        menuTemplate.push({
          label: 'Open Link in Background',
          click: () => { shell.openExternal(params.linkURL, { activate: false }) }
        })
      }
      menuTemplate.push({
        label: 'Copy link Address',
        click: () => { clipboard.writeText(params.linkURL) }
      })
      menuTemplate.push({ type: 'separator' })
    }

    // Editing
    const {
      canUndo,
      canRedo,
      canCut,
      canCopy,
      canPaste,
      canSelectAll
    } = params.editFlags

    // Undo / redo
    if (canUndo || canRedo) {
      menuTemplate.push({ label: 'Undo', role: 'undo', enabled: canUndo })
      menuTemplate.push({ label: 'Redo', role: 'redo', enabled: canRedo })
      menuTemplate.push({ type: 'separator' })
    }

    // Text editing
    const textEditingMenu = [
      canCut ? { label: 'Cut', role: 'cut' } : null,
      canCopy ? { label: 'Copy', role: 'copy' } : null,
      canPaste ? { label: 'Paste', role: 'paste' } : null,
      canPaste ? { label: 'Paste and match style', role: 'pasteandmatchstyle' } : null,
      canSelectAll ? { label: 'Select all', role: 'selectall' } : null
    ].filter((item) => item !== null)
    if (textEditingMenu.length) {
      textEditingMenu.forEach((item) => menuTemplate.push(item))
      menuTemplate.push({ type: 'separator' })
    }

    // WMail
    menuTemplate.push({
      label: 'WMail Settings',
      click: () => { ipcRenderer.sendToHost({ type: 'open-settings' }) }
    })
    const menu = Menu.buildFromTemplate(menuTemplate)
    menu.popup(remote.getCurrentWindow())
  })

  module.exports = {
    setSpellchecker: (sc) => { spellchecker = sc }
  }
})()
