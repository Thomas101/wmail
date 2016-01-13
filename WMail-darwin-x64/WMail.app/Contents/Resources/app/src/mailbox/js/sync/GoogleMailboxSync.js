"use strict"

const MMailbox = require('../models/MMailbox')
const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const gPlus = google.plus('v1');
const gmail = google.gmail('v1');
const credentials = require('../../../credentials')

class GoogleMailboxSync {
	/***************************************************************************/
	// Lifecycle
	/***************************************************************************/
	constructor(mailboxId) {
		this.mailboxId = mailboxId
		this.googleAuthTime = undefined
		this.auth = null
		this.setupAuth()
	}

	/***************************************************************************/
	// Properties
	/***************************************************************************/

	get googleAuthTimeChanged() {
		return MMailbox.get(this.mailboxId).googleAuthTime !== this.googleAuthTime
	}
	get canRequest() { return !!this.auth }

	/***************************************************************************/
	// Syncing
	/***************************************************************************/

	/**
	* Sets up the client using the oauth data
	*/
	setupAuth() {
		if (!this.googleAuthTimeChanged) { return }

		let mailbox = MMailbox.get(this.mailboxId)
		if (mailbox.hasGoogleAuth) {
			this.auth = new OAuth2(credentials.GOOGLE_CLIENT_ID, credentials.GOOGLE_CLIENT_SECRET);
			this.auth.setCredentials({
				access_token 		: mailbox.googleAccessToken,
				refresh_token 	: mailbox.googleRefreshToken,
				expiry_date 		: mailbox.googleAuthExpiryTime
			})
		} else {
			this.auth = null
		}
	}

	/***************************************************************************/
	// Fetching
	/***************************************************************************/

	/**
	* Fetches the profile info
	* @return promise
	*/
	fetchProfile() {
		return new Promise((resolve, reject) => {
			if (!this.canRequest) {
				reject("Local - Mailbox missing authentication information")
			} else {
				let payload = { userId:'me', auth:this.auth }
				gPlus.people.get(payload, function(err, response) {
					if (err) {
						reject(err)
					} else {
						resolve(response)
					}
				})
			}
		})
	}

	/**
	* Fetches the unread mail count
	* @return promise
	*/
	fetchMailUnreadCount() {
		return new Promise((resolve, reject) => {
			if (!this.canRequest) {
				reject("Local - Mailbox missing authentication information")
			} else {
				let mailbox = MMailbox.get(this.mailboxId)
				if (!mailbox.email) {
					reject("Local - Mailbox has no email address")
				} else {
					let payload = { userId:mailbox.email, q:'label:inbox label:unread', auth:this.auth }
					gmail.users.threads.list(payload, function(err, response) {
						if (err) {
							reject(err)
						} else {
							resolve(response)
						}
					})
				}
			}
		})
	}
}

module.exports = GoogleMailboxSync
