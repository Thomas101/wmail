const { remote, ipcRenderer } = require('electron')
const { shell, clipboard, Menu } = remote
const webContents = remote.getCurrentWebContents()
const dictInfo = require('../../../../app/shared/dictionaries.js')

class ContextMenu {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param spellchecker=undefined: the spellchecker to use for suggestions
  */
  constructor (spellchecker = undefined) {
    this.spellchecker = spellchecker

    webContents.removeAllListeners('context-menu') // Failure to do this will cause an error on reload
    webContents.on('context-menu', this.launchMenu.bind(this))
  }

  /* **************************************************************************/
  // Menu
  /* **************************************************************************/

  /**
  * Renders menu items for spelling suggestions
  * @param suggestions: a list of text suggestions
  * @return a list of menu items
  */
  _renderSuggestionMenuItems_ (suggestions) {
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

  /**
  * Launches the context menu
  * @param evt: the event that fired
  * @param params: the parameters passed alongisde the event
  */
  launchMenu (evt, params) {
    const menuTemplate = []

    // Spelling suggestions
    if (params.isEditable && params.misspelledWord && this.spellchecker && this.spellchecker.hasSpellchecker) {
      const suggestions = this.spellchecker.suggestions(params.misspelledWord)
      if (suggestions.primary && suggestions.secondary) {
        menuTemplate.push({
          label: (dictInfo[suggestions.primary.language] || {}).name || suggestions.primary.language,
          submenu: this._renderSuggestionMenuItems_(suggestions.primary.suggestions)
        })
        menuTemplate.push({
          label: (dictInfo[suggestions.secondary.language] || {}).name || suggestions.secondary.language,
          submenu: this._renderSuggestionMenuItems_(suggestions.secondary.suggestions)
        })
      } else {
        const suggList = (suggestions.primary.suggestions || suggestions.secondary.suggestions || [])
        this._renderSuggestionMenuItems_(suggList).forEach((item) => menuTemplate.push(item))
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
    menuTemplate.push({
      label: 'Inspect',
      click: () => { webContents.inspectElement(params.x, params.y) }
    })
    const menu = Menu.buildFromTemplate(menuTemplate)
    menu.popup(remote.getCurrentWindow())
  }
}

module.exports = ContextMenu
