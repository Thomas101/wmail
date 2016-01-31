require('./clickReport')
require('./zoomLevel')
require('./spellchecker')()

/**
* Interfaces with the way gmail opens new windows. They do....
* w = window.open("", "_blank", "")
* w.document.write('<META HTTP-EQUIV="refresh" content="0; url=https://www.google.com/contacts/u/0">')
* this proxies that request and sends it up to be opened
*/
;(function () {
  'use strict'

  const ipcRenderer = require('electron').ipcRenderer
  const defaultfn = window.open

  window.open = function () {
    if (arguments[0] === '' && arguments[1] === '_blank') {
      return {
        document: {
          write: function (value) {
            const parser = new window.DOMParser()
            const xml = parser.parseFromString(value, 'text/xml')
            if (xml.firstChild && xml.firstChild.getAttribute('HTTP-EQUIV') === 'refresh') {
              const content = xml.firstChild.getAttribute('content')
              const url = content.replace('0; url=', '')
              ipcRenderer.sendToHost({ type: 'js-new-window', url: url })
            }
          }
        }
      }
    } else {
      return defaultfn.apply(this, Array.from(arguments))
    }
  }
})()
