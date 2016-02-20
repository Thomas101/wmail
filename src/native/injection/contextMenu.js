;(function () {
  'use strict'

  const electron = require('electron')
  const remote = electron.remote
  const Menu = remote.Menu
  const shell = remote.require('shell')
  const SpellChecker = require('spellchecker')

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

  document.addEventListener('contextmenu', (evt) => {
    const x = evt.clientX
    const y = evt.clientY
    const selection = window.getSelection()
    const textSelection = selection.toString().trim()
    const menu = []

    // Spell check suggestions
    if (isTexteditorTarget(evt)) {
      if (textOnlyRE.exec(textSelection) === null) {
        if (SpellChecker.isMisspelled(textSelection)) {
          const suggestions = SpellChecker.getCorrectionsForMisspelling(textSelection)
          if (suggestions.length) {
            suggestions.forEach((s) => {
              menu.push({
                label: s,
                click: () => {
                  const range = selection.getRangeAt(0)
                  range.deleteContents()
                  range.insertNode(document.createTextNode(s))
                }
              })
            })
          } else {
            menu.push({ label: 'No Spelling Suggestions', enabled: false })
          }
          menu.push({ type: 'separator' })
        }
      }
    }

    // Link
    const linkTarget = isLinkTarget(evt)
    if (linkTarget && linkTarget.indexOf('://') !== -1) {
      menu.push({ label: 'Open Link', click: () => {
        shell.openExternal(linkTarget)
      }})
      menu.push({ label: 'Open Link in Background', click: () => {
        shell.openExternal(linkTarget, { activate: false })
      }})
      menu.push({ type: 'separator' })
    }

    // Undo / redo
    menu.push({ label: 'Undo', role: 'undo' })
    menu.push({ label: 'Redo', role: 'redo' })
    menu.push({ type: 'separator' })

    // Text editor / text selection
    if (isTexteditorTarget(evt)) {
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
})()
