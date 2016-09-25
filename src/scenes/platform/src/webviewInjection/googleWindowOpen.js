/**
* Interfaces with the way gmail opens new windows. They do....
* w = window.open("", "_blank", "")
* w.document.write('<META HTTP-EQUIV="refresh" content="0; url=https://www.google.com/contacts/u/0">')
* this proxies that request and sends it up to be opened
*/
;(function () {
  'use strict'

  const ipcRenderer = require('electron').ipcRenderer
  const fs = require('fs')
  const path = require('path')
  let gmail

  /**
  * Injects the window.open polyfill
  */
  const injectWindow = function (w) {
    const defaultfn = w.open

    w.open = function () {
      // Open message in new window -- old style
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
      } else if (arguments[0].indexOf('ui=2') !== -1 && arguments[0].indexOf('view=btop') !== -1) {
        // Open message in new window
        const ik = gmail.tracker.ik
        const msgId = window.location.hash.split('/').pop().replace(/#/, '').split('?')[0]
        ipcRenderer.sendToHost({
          type: 'js-new-window',
          url: 'https://mail.google.com/mail?ui=2&view=lg&ik=' + ik + '&msg=' + msgId
        })
        return { closed: false, focus: function () { } }
      } else {
        return defaultfn.apply(this, Array.from(arguments))
      }
    }
  }

  /**
  * Injects our support scripts
  */
  const injectScripts = function () {
    [
      path.join(__dirname, '../../../app/node_modules/jquery/dist/jquery.min.js'),
      path.join(__dirname, '../../../app/node_modules/gmail-js/src/gmail.js')
    ].forEach((path) => {
      const element = document.createElement('script')
      element.type = 'text/javascript'
      element.innerHTML = fs.readFileSync(path, 'utf8')
      document.head.appendChild(element)
    })
    gmail = new window.Gmail()
  }

  // Inject into the main window
  injectWindow(window)

  // Inject into the subframes. This is used for opening pdfs for example
  document.addEventListener('DOMContentLoaded', function () {
    injectScripts()
    const frames = document.querySelectorAll('iframe')
    for (let i = 0; i < frames.length; i++) {
      try {
        injectWindow(frames[i].contentWindow)
      } catch (ex) { }
    }
  }, false)
})()
