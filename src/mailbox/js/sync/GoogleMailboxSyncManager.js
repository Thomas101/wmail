"use strict"

const MMailbox = require('../models/MMailbox')
const GoogleMailboxSync = require('./GoogleMailboxSync')

class GoogleMailboxSyncManager {
	/***************************************************************************/
	// Lifecycle
	/***************************************************************************/
	constructor(app) {
		this.app = app
		this.sync = new Map()
		this.pollers = {
			profile : null,
			unread : null
		}
	}

	/***************************************************************************/
	// Pollers
	/***************************************************************************/

	/**
	* Resyncs periodically
	*/
	startPollSync() {
		clearInterval(this.pollers.profile)
		clearInterval(this.pollers.unread)
		this.pollers.profile = setInterval(() => {
			this.resyncProfiles()
		}, 1000 * 60 * 30) // 30 mins
		this.pollers.unread = setInterval(() => {
			this.resyncUnreadCounts()
		}, 1000 * 60) // 1 minute
	}

	/***************************************************************************/
	// Syncing
	/***************************************************************************/

	/**
	* Sets up the sync tasks by adding and removing the tasks
	*/
	_setupSyncTasks() {
		this.sync = MMailbox.ids().reduce((acc, id) => {
			acc.set(id, this.sync.has(id) ? this.sync.get(id) : new GoogleMailboxSync(id))
			return acc
		}, new Map())
	}

	/**
	* Syncs the profiles and bubbles the event
	*/
	resyncProfiles() {
		this._setupSyncTasks()

		if (this.sync.size) {
			let requests = []
			this.sync.forEach((_sync, mailboxId) => {
				requests.push(this.resyncProfile(mailboxId))
			})

			Promise.all(requests).then(
				() => { this.app.procChange() },
				(err) => { console.warn('[SYNC ERR]', err) }
			)
		}
	}

	/**
	* Resyncs a profile
	* @param mailboxId: the id of the mailbox
	* @return promise
	*/
	resyncProfile(mailboxId) {
		let task = this.sync.get(mailboxId)
		if (!task) {
			task = new GoogleMailboxSync(mailboxId)
			this.sync.set(mailboxId, task)
		}

		return task.fetchProfile().then(res => {
			let mailbox = MMailbox.get(mailboxId)
			mailbox.avatar = res.image.url
			mailbox.email = (res.emails.find(a => a.type === 'account' ) || {}).value
			mailbox.name = res.displayName
			mailbox.save()
		})
	}

	/**
	* Syncs the unread
	*/
	resyncUnreadCounts() {
		this._setupSyncTasks()

		if (this.sync.size) {
			let requests = []
			this.sync.forEach((sync, mailboxId) => {
				requests.push(this.resyncUnreadCount(mailboxId))
			})

			Promise.all(requests).then(
				() => { this.app.procChange() },
				(err) => { console.warn('[SYNC ERR]', err) }
			)
		}
	}

	/**
	* Resyncs an unread count
	* @param mailboxId: the id of the mailbox
	* @return promise
	*/
	resyncUnreadCount(mailboxId) {
		let task = this.sync.get(mailboxId)
		if (!task) {
			task = new GoogleMailboxSync(mailboxId)
			this.sync.set(mailboxId, task)
		}
		
		return task.fetchMailUnreadCount().then(res => {
			let mailbox = MMailbox.get(mailboxId)
			mailbox.unread = res.resultSizeEstimate
			mailbox.save()
		})
	}
}

module.exports = GoogleMailboxSyncManager