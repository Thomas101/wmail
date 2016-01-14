"use strict"

const remote = require('remote')
const shell = remote.require('shell')
const MMailbox = require('./models/MMailbox')
const mailboxActions = require('./actions/mailbox')

class Mailboxes {
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
		$('#mailboxes .mailbox.active:not([data-id="' + mailboxId + '"])').removeClass('active')
		$('#mailboxes .mailbox[data-id="' + mailboxId + '"]').addClass('active')
	}

	/***************************************************************************/
	// Rendering
	/***************************************************************************/

	/**
	* Renders a webview
	* @param mailbox: the mailbox to render
	* @return the element
	*/
	renderWebview(mailbox) {
		// Generate source
		var src
		switch(mailbox.type) {
			case 'ginbox': src='https://inbox.google.com'; break;
			case 'gmail': src='https://mail.google.com?ibxr=0'; break;
		}

		// Create dom
		let webview = $([
			'<webview',
				'class="mailbox"',
				'data-id="' + mailbox.id + '"',
				'src="' + src + '"',
				'partition="persist:' + mailbox.id + '"',
				'preload="./js/sniff/clicklisten"',
				'></webview>'
			].join(' ')).get(0)

		// Bind events
		webview.addEventListener('dom-ready', () => {
			webview.insertCSS('.gb_9a { visibility: hidden !important; }')
		})
		webview.addEventListener('ipc-message', (event) => {
			if (event.channel.type === 'page-click') {
				this.app.procResyncMailboxUnread(mailbox.id)
			}
		});
		webview.addEventListener('new-window', (event) => {
			shell.openExternal(event.url)
		})

		return webview
	}

	/**
	* Renders the welcome view
	*/
	renderWelcome() {
		const welcome = $([
			'<div class="welcome">',
				'<h1>Add your first mailbox</h1>',
				'<p>',
					'To get started you need to add a mailbox. You can add your Gmail or Google Inbox account.',
					'<br />',
					'<small>To add more mailboxes later on just tap the plus icon in the toolbar on the left</small>',
				'</p>',
				'<br />',
				'<br />',
				'<button type="button" class="btn inbox">Add Inbox Mailbox</button>',
				'<button type="button" class="btn gmail">Add Gmail Mailbox</button>',
			'</div>'
		].join('\n'))
		welcome.find('.btn.inbox').on('click', (evt) => {
			evt.preventDefault();
			mailboxActions.addInboxMailbox(this.app)
		})
		welcome.find('.btn.gmail').on('click', (evt) => {
			evt.preventDefault();
			mailboxActions.addGmailMailbox(this.app)
		})
		return welcome
	}

	/**
	* Render the webviews based on the database
	*/
	render() {
		let container = $('#mailboxes')
		let mailboxIds = new Set(MMailbox.ids())

		// Delete un-needed webviews
		container.find('.mailbox').each((_index, elem) => {
			if (!mailboxIds.has($(elem).attr('data-id'))) {
				$(elem).remove()
			}
		})

		// Add new webviews
		MMailbox.all().forEach((mailbox, index) => {
			if (container.find('.mailbox[data-id="' + mailbox.id + '"]').length === 0) {
				container.append(this.renderWebview(mailbox))
			}
		})

		if (mailboxIds.size === 0) {
			if (container.find('.welcome').length === 0) {
				container.append(this.renderWelcome())
			}
		} else {
			container.find('.welcome').remove();
		}
	}
}

module.exports = Mailboxes