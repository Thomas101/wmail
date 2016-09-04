;(function () {
  'use strict'

  const ipcRenderer = require('electron').ipcRenderer

  /**
  * Injects the custom content into the dom, making the assumption the head is ready
  * @param js=undefined: the js to inject
  * @param css=undefined: the css to inject
  */
  const injectCustomContent = function (js, css) {
    console.log('injecting')
    if (js) {
      console.log('injecting js')
      const element = document.createElement('script')
      element.type = 'text/javascript'
      element.innerHTML = js
      document.head.appendChild(element)
    }
    if (css) {
      console.log('injecting css')
      const element = document.createElement('style')
      element.innerHTML = css
      document.head.appendChild(element)
    }
  }

  /**
  * Tries to inject the custom content waiting for the head to be ready first
  * @param js: the js to inject
  * @param css: the css to inject
  */
  const tryInjectCustomContent = function (js, css) {
    if (document.head) {
      injectCustomContent(js, css)
    } else {
      const interval = setInterval(() => {
        if (document.head) {
          clearInterval(interval)
          injectCustomContent(js, css)
        }
      }, 100)
    }
  }

  ipcRenderer.on('inject-custom-content', (evt, data) => {
    console.log('in inject-custom-content')
    if (!data.js && !data.css) { return }
    tryInjectCustomContent(data.js, data.css)
  })
})()
