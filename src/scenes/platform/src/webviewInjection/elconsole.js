;(function () {
  'use strict'

  const ipcRenderer = require('electron').ipcRenderer
  module.exports = {
    log: function () {
      ipcRenderer.sendToHost({
        type: 'elevated-log',
        messages: Array.from(arguments)
      })
    },
    error: function () {
      ipcRenderer.sendToHost({
        type: 'elevated-error',
        messages: Array.from(arguments)
      })
    }
  }
})()
