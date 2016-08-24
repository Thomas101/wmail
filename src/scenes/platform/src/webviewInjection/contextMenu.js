;(function () {
  'use strict'

  const { remote, ipcRenderer } = require('electron')
  const { shell, clipboard } = remote
  const ContextMenuView = require('./ContextMenuView')
  const request = require('../../../app/node_modules/request')
  const { SPELLCHECK_HTTP_PORT } = require('../../../app/shared/constants')

  let dictionary
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
    const menuTemplate = []
    let menu

    // Spell check suggestions
    if (dictionary) {
      if (isTexteditorTarget(evt)) {
        if (textOnlyRE.exec(textSelection) === null) {
          if (!dictionary.check(textSelection)) {
            menuTemplate.push({ label: 'Fetching Suggestions...', enabled: false })
            menuTemplate.push({ type: 'separator' })

            request('http://localhost:' + SPELLCHECK_HTTP_PORT + '/suggest?word=' + encodeURIComponent(textSelection), (err, response, body) => {
              if (err) {
                menuTemplate.splice(0, 1)
                menuTemplate.unshift({ label: 'Error Fetching Suggestions', enabled: false })
              } else {
                menuTemplate.splice(0, 1)
                const suggestions = JSON.parse(body)

                if (suggestions.length) {
                  suggestions.reverse().forEach((s) => {
                    menuTemplate.unshift({
                      label: s,
                      click: () => {
                        const range = selection.getRangeAt(0)
                        range.deleteContents()
                        range.insertNode(document.createTextNode(s))
                      }
                    })
                  })
                } else {
                  menuTemplate.unshift({ label: 'No Spelling Suggestions', enabled: false })
                }
              }
              menu.update(menuTemplate)
            })
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
      menuTemplate.push({
        label: 'Open Link in Background',
        click: () => {
          shell.openExternal(linkTarget, { activate: false })
        }
      })
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
    menu = new ContextMenuView().show(menuTemplate, x, y)
  }, false)

  module.exports = {
    setDictionary: (dict) => {
      dictionary = dict
    }
  }
})()
