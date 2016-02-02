;(function () {
  'use strict'

  const electron = require('electron')
  const remote = electron.remote
  const Menu = remote.Menu

  const textOnlyRE = new RegExp(/[^a-z]+/gi)

  class ContextMenu {
    /* **************************************************************************/
    // Lifecycle
    /* **************************************************************************/

    constructor () {
      document.addEventListener('contextmenu', (evt) => {
        const x = evt.clientX
        const y = evt.clientY
        const selection = window.getSelection()
        const textSelection = selection.toString()
        const menu = []

        // Spell check suggestions
        if (this.__spellcheckProvider__) {
          if (this.isTexteditorTarget(evt)) {
            if (textOnlyRE.exec(textSelection.trim()) === null) {
              const suggestions = this.__spellcheckProvider__.suggest(textSelection.trim())
              if (suggestions.length) {
                suggestions.forEach(s => {
                  menu.push({
                    label: s,
                    click: () => {
                      const range = selection.getRangeAt(0)
                      range.deleteContents()
                      range.insertNode(document.createTextNode(s))
                    }
                  })
                })
                menu.push({ type: 'separator' })
              }
            }
          }
        }

        // Undo / redo
        menu.push({ label: 'Undo', role: 'undo' })
        menu.push({ label: 'Redo', role: 'redo' })
        menu.push({ type: 'separator' })

        // Text editor / text selection
        if (this.isTexteditorTarget(evt)) {
          menu.push({ label: 'Cut', role: 'cut' })
          menu.push({ label: 'Copy', role: 'copy' })
          menu.push({ label: 'Paste', role: 'paste' })
          menu.push({ type: 'separator' })
        } else if (textSelection) {
          menu.push({ label: 'Copy', role: 'copy' })
          menu.push({ type: 'separator' })
        }

        // Misc
        menu.push({ label: 'Select all', role: 'selectall' })
        Menu.buildFromTemplate(menu).popup(remote.getCurrentWindow(), x, y)
      }, false)
    }

    /* **************************************************************************/
    // Properties
    /* **************************************************************************/

    set spellcheckProvider (v) { this.__spellcheckProvider__ = v }

    /* **************************************************************************/
    // Utils
    /* **************************************************************************/

    isTexteditorTarget (evt) {
      if (evt.target.tagName === 'INPUT' || evt.target.tagName === 'TEXTAREA') { return true }
      if (evt.path.findIndex(e => e.getAttribute && e.getAttribute('contentEditable') === 'true') !== -1) { return true }
      return false
    }

  }

  module.exports = new ContextMenu()
})()
