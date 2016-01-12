"use strict"

const remote = require('remote');
const Menu = remote.require('menu');
const MMailbox = require('./models/MMailbox')
const mailboxActions = require('./actions/mailbox')

class MailboxList {
	/***************************************************************************/
	// Lifecycle
	/***************************************************************************/
	constructor(app) {
		this.app = app
	}

	/***************************************************************************/
	// Active state
	/***************************************************************************/

	/**
	* Updates the active mailbox
	* @param mailboxId: the id of the mailbox to make active
	*/
	updateActive(mailboxId) {
		$('#mailbox-list .mailbox.active:not([data-id="' + mailboxId + '"])').removeClass('active')
		$('#mailbox-list .mailbox[data-id="' + mailboxId + '"]').addClass('active')
	}

	/***************************************************************************/
	// Rendering
	/***************************************************************************/

	/**
	* Renders a single mailbox
	* @param activeId: the id of the active mailbox
	* @param mailbox: the mailbox record to render
	* @param index: the index of the mailbox
	* @return the element
	*/
	renderMailbox(activeId, mailbox, index) {
		let className = mailbox.id === activeId ? 'mailbox active' : 'mailbox'

		// Generate avatar
		var avatarHTML
		if (mailbox.avatar) {
			avatarHTML = '<img class="avatar" src="' + mailbox.avatar + '" />'
		} else {
			avatarHTML = '<span class="index">' + (index + 1) + '</span>'
		}

		// Generate title
		var title = []
		if (mailbox.email) { title.push(mailbox.email) }
		if (mailbox.name) { title.push('(' + mailbox.name + ')') }
		title = title.join(' ')

		// Generate unread
		var unread
		if (mailbox.unread) {
			unread = '<span class="unread">' + mailbox.unread + '</span>'
		}

		// Generate whole button
		let button = $([
			'<div class="mailbox-container" data-id="' + mailbox.id + '">',
				'<div class="' + className + '" title="' + title + '" data-id="' + mailbox.id + '" data-type="' + mailbox.type + '">',
					avatarHTML,
				'</div>',
				unread,
			'</div>'
		].join('\n'))

		// Bind events
		button.on('click', (evt) => {
			evt.preventDefault()
			this.app.procChangeActive(mailbox.id)
		})
		button.on('contextmenu', (evt) => {
			evt.preventDefault()

			let menu = Menu.buildFromTemplate([
				{ label: 'Delete', click: () => {
					if (button.is('.active')) { this.app.procChangeActive() }
					MMailbox.remove(mailbox.id)
					this.app.procChange()
				}},
				{ type: "separator" },
				{ label: 'Reload', click: () => {
					$('#mailboxes .mailbox[data-id="' + mailbox.id + '"]').attr('src', 'https://inbox.google.com/')
					this.app.procResyncRemote()
				}},
				{ label: 'Inspect', click: () => {
					$('#mailboxes .mailbox[data-id="' + mailbox.id + '"]').get(0).openDevTools()
				}}
			])
			menu.popup(remote.getCurrentWindow())
		})

		return button
	}

	/**
	* Renders the add button
	* @return the button to append to the dom
	*/
	renderAdd() {
		let button = $('<div class="add-mailbox" title="Add Mailbox">+</div>')
		button.on('click', (evt) => {
			evt.preventDefault()

			let menu = Menu.buildFromTemplate([
				{ label: 'Add Inbox', click: () => {
					mailboxActions.addInboxMailbox(this.app)
				}},
				{ label: 'Add Gmail', click: () => {
					mailboxActions.addGmailMailbox(this.app)
				}}
			])
			menu.popup(remote.getCurrentWindow())
		})

		return button
	}

	/**
	* Renders the mailbox list
	*/
	render() {
		// Store state
		let container = $('#mailbox-list')
		let activeId = container.find('.mailbox.active').attr('data-id')
		container.empty()

		// Render the mailboxes
		container.append(MMailbox.all().map((mailbox, index) => {
			return this.renderMailbox(activeId, mailbox, index)
		}))

		// Render the other controls
		container.append(this.renderAdd())
	}
}

module.exports = MailboxList