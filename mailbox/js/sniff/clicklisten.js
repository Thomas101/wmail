"use strict"

const ipcRenderer = require('electron').ipcRenderer

;(function() {
	let timeout = null
	let loadInterval = setInterval(function() {
		if (document.body) {
			clearInterval(loadInterval)
			document.body.addEventListener('click', function(evt) {
				clearTimeout(timeout)
				timeout = setTimeout(function() {
					ipcRenderer.sendToHost({
						type : 'page-click',
						throttled : true
					})
				}, 1000)
			})
		}
	}, 1000)
})()