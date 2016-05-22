;(function () {
  'use strict'

  const ipcRenderer = require('electron').ipcRenderer
  let throttle = null
  let throttleCount = 1
  const loader = setInterval(function () {
    if (document.body) {
      clearInterval(loader)
      document.body.addEventListener('click', function (evt) {
        if (throttle !== null) {
          clearTimeout(throttle)
          throttle = null
          throttleCount += 0.5
        }
        throttle = setTimeout(function () {
          ipcRenderer.sendToHost({
            type: 'page-click',
            throttled: true,
            throttle: 1500 / throttleCount
          })
          throttleCount = 1
        }, 1500 / throttleCount)
      }, false)
    }
  }, 500)
})()
