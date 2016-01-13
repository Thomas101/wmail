"use strict"

const storage = require('./storage')
const uuid = require('../uuid')

var databaseKey = function(id) { return 'Mailbox_' + id }

class Mailbox {
	/***************************************************************************/
	// Lifecycle
	/***************************************************************************/

	constructor(id, data) {
		this.__id__ = id
		this.__data__ = data
	}

	/**
	* Saves the model to database
	* @return this
	*/
	save() {
		this.__data__.changed = new Date().getTime()
		storage.set(databaseKey(this.__id__), this.__data__)
		return this
	}

	/***************************************************************************/
	// Properties
	/***************************************************************************/
	get id() { return this.__id__; }
	get type() { return this.__data__.type || 'ginbox'; }
	set type(v) { return this.__data__.type = v; }

	/***************************************************************************/
	// Properties : Account Details
	/***************************************************************************/

	get avatar() { return this.__data__.avatar; }
	set avatar(v) { this.__data__.avatar = v; }
	get email() { return this.__data__.email; }
	set email(v) { this.__data__.email = v; }
	get name() { return this.__data__.name; }
	set name(v) { this.__data__.name = v; }
	get unread() { return this.__data__.unread; }
	set unread(v) { this.__data__.unread = v; }

	/***************************************************************************/
	// Properties : Google Auth
	/***************************************************************************/

	set googleAuth(v) {
		if (!v) {
			this.__data__.googleAuth = undefined
		} else {
			this.__data__.googleAuth = Object.assign({ date : new Date().getTime() }, v)	
		}
	}
	get googleAuth() { return this.__data__.googleAuth; }
	get googleAuthTime() { return (this.googleAuth || {}).date; }
	get hasGoogleAuth() { return this.googleAuth !== undefined; }
	get googleAccessToken() { return (this.googleAuth || {}).access_token; }
	get googleRefreshToken() { return (this.googleAuth || {}).refresh_token; }
	get googleAuthExpiryTime() { return ((this.googleAuth || {}).date || 0) + ((this.googleAuth || {}).expires_in || 0) }
}




class Manager {
	/***************************************************************************/
	// Lifecycle
	/***************************************************************************/

	constructor() {
		this.__cache__ = new Map()
	}

	/***************************************************************************/
	// Multiple items
	/***************************************************************************/

	/**
	* @return the list of ids in order
	*/
	ids() { return storage.get('Mailbox_index', []) }

	/**
	* @return all the models in order
	*/
	all() { return this.ids().map(id => this.get(id)) }

	/**
	* @return the total unread count for all accounts
	*/
	totalUnread() {
		return this.all().reduce((acc, mailbox) => {
			if (mailbox && !isNaN(mailbox.unread)) {
				acc += mailbox.unread
			}
			return acc
		}, 0)
	}

	/***************************************************************************/
	// Single items
	/***************************************************************************/

	/**
	* @return a new available id
	*/
	provisionId() { return uuid.uuid4() }

	/**
	* Creates and saves a new model
	* @param id: the id for the model
	* @return the model instance
	*/
	create(id) {
		// Create the rec
		let mailbox = new Mailbox(id, {
			created : new Date().getTime()
		}).save()
		this.__cache__.set(id, mailbox)

		// Update the index
		let index = storage.get('Mailbox_index', [])
		index.push(mailbox.id)
		storage.set('Mailbox_index', index)

		return mailbox
	}

	/**
	* Gets a model with the given id
	* @param id: the id of the model
	* @return the model instance or null if it doesn't exist
	*/
	get(id) {
		let key = databaseKey(id)
		if (this.__cache__.get(id) === undefined) {
			let data = storage.get(key)
			this.__cache__.set(id, data ? new Mailbox(id, data) : null)
		}
		return this.__cache__.get(id)
	}

	/**
	* Deletes a given item
	* @param id: the id of the model
	*/
	remove(id) {
		var index = storage.get('Mailbox_index', [])
		index = index.filter(i => i !== id)
		storage.set('Mailbox_index', index)

		this.__cache__.delete(id)
		storage.remove(databaseKey(id))
	}
}

module.exports = new Manager()