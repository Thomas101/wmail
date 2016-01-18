;(function() {
	"use strict"
	
	const electron = require('electron')
	const webFrame = electron.webFrame;
	const ipc = electron.ipcRenderer
	
	ipc.on('zoom-factor-set', (evt, data) => {
		webFrame.setZoomFactor(data.value)
	})
})()