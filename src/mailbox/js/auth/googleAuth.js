"use strict"

const ipcRenderer = require('electron').ipcRenderer;

class GoogleAuthClient {
	/*****************************************************************************/
	// Lifecycle
	/*****************************************************************************/

	constructor() {
		this.requests = {}
		ipcRenderer.on('auth-google-complete', (evt, body) => {
			this.requests[body.id](evt, body)
			delete this.requests[body.id]
		})
	}

	/*****************************************************************************/
	// Request handlers
	/*****************************************************************************/

	/**
	* Auth a frame with the given id
	* @param id: the id of the mailbox to auth
	* @return promise
	*/
	auth(id) {
		return new Promise((resolve, reject) => {
			this.requests[id] = (evt, body) => {
				resolve(body.auth)
			}
			ipcRenderer.send('auth-google', { id:id })
		})
	}
}

module.exports = new GoogleAuthClient()