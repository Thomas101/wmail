"use strict"

const ipcMain = require('electron').ipcMain;
const electronGoogleOauth = require('electron-google-oauth')  
const credentials = require('../credentials')

class GoogleAuth {
	/*****************************************************************************/
	// Lifecycle
	/*****************************************************************************/

	constructor() {
		ipcMain.on('auth-google', (evt, body) => {
			this.handleAuthGoogle(evt, body)
		})
	}

	/*****************************************************************************/
	// Request Handlers
	/*****************************************************************************/

	/**
	* Handles the oauth request
	* @param evt: the incoming event
	* @param body: the body sent to us
	*/
	handleAuthGoogle(evt, body) {
		electronGoogleOauth(undefined, {
        useContentSize  					: true,
        center 										: true,
        show 											: true,
        resizable 								: false,
        alwaysOnTop 							: true,
        standardWindow 						: true,
        autoHideMenuBar 					: true,
        webPreferences						: {
          nodeIntegration 					: false,
          partition 								: "persist:" + body.id
        }
    }).getAccessToken(
			[
				'https://www.googleapis.com/auth/plus.me',
				'profile',
				'email',
				'https://www.googleapis.com/auth/gmail.readonly'
			],
			credentials.GOOGLE_CLIENT_ID,
			credentials.GOOGLE_CLIENT_SECRET
		).then(auth => {
			evt.sender.send('auth-google-complete', {
				id : body.id,
				auth : auth
			})
		})
	}
}

module.exports = new GoogleAuth()