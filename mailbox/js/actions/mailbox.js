"use strict"

const MMailbox = require('../models/MMailbox')
const GoogleAuthClient = require('../../../auth/GoogleAuthClient')

module.exports = {
	/**
	* Adds a gmail mailbox
	* @param app: the app reference that can process callbacks
	*/
	addGmailMailbox : function(app) {
		let client = new GoogleAuthClient()
		let id = MMailbox.provisionId()
		client.auth(id).then(auth => {
			let mailbox = MMailbox.create(id)
			mailbox.type = 'gmail'
			mailbox.googleAuth = auth
			mailbox.save()
			app.procChange()
			app.procResyncRemote(id)
			app.procChangeActive(id)
		})
	},
	/**
	* Adds an inbox mailbox
	* @param app: the app reference that can process callbacks
	*/
	addInboxMailbox : function(app) {
		let client = new GoogleAuthClient()
		let id = MMailbox.provisionId()
		client.auth(id).then(auth => {
			let mailbox = MMailbox.create(id)
			mailbox.type = 'ginbox'
			mailbox.googleAuth = auth
			mailbox.save()
			app.procChange()
			app.procResyncRemote(id)
			app.procChangeActive(id)
		})
	}
}