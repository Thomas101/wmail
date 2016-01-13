"use strict"

const Server = require('electron-rpc/server')
const electronGoogleOauth = require('electron-google-oauth')  
const credentials = require('../credentials')

class GoogleAuthServer {
	/*****************************************************************************/
	// Lifecycle
	/*****************************************************************************/

	/**
	* @param webContent: the webcontent to listen on
	*/
	constructor(webContent) {
		this.app = new Server()
		this.app.configure(webContent)
		this.app.on('authgoogle', (req, done) => this.handleAuthGoogle(req, done))
	}

	/*****************************************************************************/
	// Request Handlers
	/*****************************************************************************/

	/**
	* Handles the oauth request
	* @param req: the incoming request
	* @param done: the function to call on completion
	*/
	handleAuthGoogle(req, done) {
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
          partition 								: "persist:" + req.body.id
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
			done(null, auth)
		})
	}
}

module.exports = GoogleAuthServer