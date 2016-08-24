;(function () {
  'use strict'

  const electron = require('electron')
  const webFrame = electron.webFrame
  const ipc = electron.ipcRenderer

  ipc.on('zoom-factor-set', (evt, data) => {
    // Cant set zoom factor due to https://github.com/electron/electron/issues/6958. Nice workaround below...
    // webFrame.setZoomFactor(data.value)
    webFrame.setZoomLevelLimits(data.value, data.value)
  })
})()
