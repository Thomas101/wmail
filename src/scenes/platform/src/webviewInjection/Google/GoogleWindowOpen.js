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
  // Utils
  /* **************************************************************************/

  /**
  * @param url: the url to get the qs argument from
  * @param key: the key of the value to get
  * @param defaultValue=undefined: the default value to return
  * @return the string value
  */
  getQSArg (url, key, defaultValue = undefined) {
    const regex = new RegExp('[\\?&]' + key + '=([^&#]*)')
    const results = regex.exec(url)
    return results === null ? defaultValue : results[1]
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
    const handlerInst = this
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
      } else if (handlerInst.gmailApi && arguments[0].indexOf('ui=2') !== -1 && arguments[0].indexOf('view=btop') !== -1) {
        const ik = handlerInst.gmailApi.tracker.ik
        const currentUrlMsgId = window.location.hash.split('/').pop().replace(/#/, '').split('?')[0]
        const th = handlerInst.getQSArg(arguments[0], 'th', currentUrlMsgId)

        ipcRenderer.sendToHost({
          type: 'js-new-window',
          url: 'https://mail.google.com/mail?ui=2&view=lg&ik=' + ik + '&msg=' + th
        })
        return { closed: false, focus: function () { } }
      } else {
        return defaultfn.apply(this, Array.from(arguments))
      }
    }
  }
}

module.exports = GoogleWindowOpen
