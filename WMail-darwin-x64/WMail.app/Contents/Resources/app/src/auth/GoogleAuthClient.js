"use strict"

const Client = require('electron-rpc/client')

class GoogleAuthClient {
	/*****************************************************************************/
	// Lifecycle
	/*****************************************************************************/

	constructor() {
		this.client = new Client()
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
			this.client.request('authgoogle', { id:id }, (err, body) => {
				if (err) {
					reject(err)
				} else {
					resolve(body)
				}
			})
		})
	}
}

module.exports = GoogleAuthClient