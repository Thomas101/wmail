const ipcRenderer = require('electron').ipcRenderer

class GoogleWindowOpen {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.gmailApi = undefined

    // Inject into the main window
    this.injectWindow(window)
    document.addEventListener('DOMContentLoaded', function () {
      const frames = document.querySelectorAll('iframe')
      for (let i = 0; i < frames.length; i++) {
        try {
          this.injectWindow(frames[i].contentWindow)
        } catch (ex) { }
      }
    }, false)
  }

  /* **************************************************************************/
  // Injection
  /* **************************************************************************/

  /**
  * Injects the window.open polyfill. Gmail opens new windows. They do....
  * w = window.open("", "_blank", "")
  * w.document.write('<META HTTP-EQUIV="refresh" content="0; url=https://www.google.com/contacts/u/0">')
  * this proxies that request and sends it up to be opened
  * @param w: the window to inject into
  */
  injectWindow (w) {
    const defaultfn = w.open
    const gmailWindowOpen = this
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
      } else if (gmailWindowOpen.gmailApi && arguments[0].indexOf('ui=2') !== -1 && arguments[0].indexOf('view=btop') !== -1) {
        // Open message in new window
        const ik = gmailWindowOpen.gmailApi.tracker.ik
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
}

module.exports = GoogleWindowOpen
