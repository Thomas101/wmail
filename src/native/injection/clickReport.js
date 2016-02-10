;(function () {
  'use strict'

  const ipcRenderer = require('electron').ipcRenderer
  let timeout = null

  document.addEventListener('click', function (evt) {
    clearTimeout(timeout)
    timeout = setTimeout(function () {
      ipcRenderer.sendToHost({
        type: 'page-click',
        throttled: true,
        throttle: 5000
      })
    }, 5000)
  })
})()
