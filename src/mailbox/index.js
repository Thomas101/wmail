"use strict"

const MailboxList = require('./MailboxList')
const Mailboxes = require('./Mailboxes')
const MMailbox = require('./models/MMailbox')
const GoogleMailboxSyncManger = require('./sync/GoogleMailboxSyncManager')
const credentials = require('shared/credentials')
const ipcRenderer = require('electron').ipcRenderer


const remote = require('remote');
const app = remote.require('app')

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
		// Bind event listeners
		document.addEventListener('drop', evt => { evt.preventDefault() }, false)
		document.addEventListener('dragover', evt => { evt.preventDefault() }, false)
		document.addEventListener('dragover', evt => { evt.preventDefault() }, false)
		ipcRenderer.on('switch-mailbox', (evt, body) => {
  		this.procChangeActive(body.mailboxId)
		})

		// Render our first run
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

		ipcRenderer.send('mailboxes-changed', {
			mailboxes : MMailbox.all().map(mailbox => {
				return { id:mailbox.id, name:mailbox.name, email:mailbox.email }
			})
		})
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

	/**
	* Execute a change active index
	*/
	procChangeActiveIndex(index) {
		const ids = MMailbox.ids()
		if (ids[index]) {
			this.procChangeActive(ids[index])
		}
	}
}

window.app = new App()