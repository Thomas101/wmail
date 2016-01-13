"use strict"

const MailboxList = require('./js/MailboxList')
const Mailboxes = require('./js/Mailboxes')
const MMailbox = require('./js/models/MMailbox')
const GoogleMailboxSyncManger = require('./js/sync/GoogleMailboxSyncManager')
const credentials = require('../credentials')

const remote = require('remote');
const app = remote.require('app');

class App {
	/***************************************************************************/
	// Lifecycle
	/***************************************************************************/
	constructor() {
		this.mailboxList = new MailboxList(this)
		this.mailboxes = new Mailboxes(this)

		this.googleMailbox = new GoogleMailboxSyncManger(this)
	}

	load() {
		document.addEventListener('drop', function(e) {
			e.preventDefault()
		})
		document.addEventListener('dragover', function(e) {
			e.preventDefault()
		})
		document.addEventListener('dragover', function(e) {
			e.preventDefault()
		})


		let activeId = MMailbox.ids()[0]
		this.procChange()
		this.procResyncRemote()
		this.procChangeActive(activeId)
		this.googleMailbox.startPollSync()
	}

	/***************************************************************************/
	// Change events
	/***************************************************************************/

	/**
	* Execute on remote data resync
	* @param mailboxId=undefined: the id of the mailbox to sync if you only want to sync one, other
	* wise all will be synced
	*/
	procResyncRemote(mailboxId) {
		if (mailboxId) {
			Promise.resolve().then(() => {
				return this.googleMailbox.resyncProfile(mailboxId)
			}).then(() => {
				return this.googleMailbox.resyncUnreadCount(mailboxId)
			}).then(
				() => { this.procChange()},
				(err) => { console.warn('[SYNC ERR]', err)}
			)
		} else {
			Promise.resolve().then(() => {
				return this.googleMailbox.resyncProfiles()
			}).then(() => {
				return this.googleMailbox.resyncUnreadCounts()
			})
		}
	}

	/**
	* Resyncs the unread count for a single mailbox
	* @param mailboxId: the id of the mailbox
	*/
	procResyncMailboxUnread(mailboxId) {
		this.googleMailbox.resyncUnreadCount(mailboxId).then(
			() => { this.procChange()},
			(err) => { console.warn('[SYNC ERR]', err)}
		)
	}

	/**
	* Execute on change
	*/
	procChange() {
		this.mailboxList.render()
		this.mailboxes.render()

		let unread = MMailbox.totalUnread()
		if (unread) {
			app.dock.setBadge(unread.toString())
		} else {
			app.dock.setBadge('')
		}
	}

	/**
	* Execute on active item change
	*/
	procChangeActive(mailboxId) {
		if (!mailboxId) {
			mailboxId = MMailbox.ids()[0]
		}
		this.mailboxList.updateActive(mailboxId)
		this.mailboxes.updateActive(mailboxId)
	}
}

window.app = new App()