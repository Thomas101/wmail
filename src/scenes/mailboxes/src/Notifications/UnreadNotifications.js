const flux = {
  mailbox: require('../stores/mailbox'),
  settings: require('../stores/settings')
}
const constants = require('shared/constants')
const {mailboxDispatch} = require('../Dispatch')
const {ipcRenderer} = window.nativeRequire('electron')

class UnreadNotifications {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.__s_mailboxesUpdated = (store) => this.mailboxesUpdated(store)
    this.__constructTime__ = new Date().getTime()
    this.__dispatching__ = false
 /* window.NNotification = require('./Notification')
 window.nn = new window.NNotification('my test title', {
   body: 'Test body is here are it is my body and it is about some stuff and stuff and stuff that just seems to go on and on'
 }) */
  }

  /**
  * Starts listening for changes
  */
  start () {
    flux.mailbox.S.listen(this.__s_mailboxesUpdated)
    this.mailboxesUpdated(flux.mailbox.S.getState())
    this.__dispatching__ = false
  }

  /**
  * Stops listening for changes
  */
  stop () {
    flux.mailbox.S.unlisten(this.__s_mailboxesUpdated)
    this.__dispatching__ = false
  }

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  /**
  * Handles the mailboxes changing by dropping out any notifications
  */
  mailboxesUpdated (store) {
    if (this.__dispatching__) { return }
    if (flux.settings.S.getState().os.notificationsEnabled === false) { return }
    const firstRun = new Date().getTime() - this.__constructTime__ < constants.GMAIL_NOTIFICATION_FIRST_RUN_GRACE_MS

    store.allMailboxes().forEach((mailbox, k) => {
      if (!mailbox.showNotifications) { return }
      const lastInternalDate = mailbox.google.unnotifiedMessages.reduce((acc, message) => {
        if (!firstRun) {
          this.showNotification(mailbox, message)
        }
        if (acc === undefined) {
          return parseInt(message.internalDate)
        } else {
          return parseInt(message.internalDate) > acc ? parseInt(message.internalDate) : acc
        }
      }, undefined)

      if (lastInternalDate !== undefined) {
        flux.mailbox.A.setGoogleLastNotifiedInternalDate.defer(mailbox.id, lastInternalDate)
      }
    })
  }

  /**
  * Shows a notification
  * @param mailbox: the mailbox to show it for
  * @param message: the message notification to show
  * @return the notification
  */
  showNotification (mailbox, message) {
    const subject = (message.payload.headers.find((h) => h.name.toLowerCase() === 'subject') || {}).value || 'No Subject'
    const fromEmail = (message.payload.headers.find((h) => h.name.toLowerCase() === 'from') || {}).value || ''

    // Extract the body
    let snippet = 'No Body'
    if (message.snippet) {
      const decoder = document.createElement('div')
      decoder.innerHTML = message.snippet
      snippet = decoder.textContent
    }

    const notification = new window.Notification(subject, {
      body: [fromEmail, snippet].join('\n'),
      silent: flux.settings.S.getState().os.notificationsSilent,
      data: { mailbox: mailbox.id, messageId: message.id, threadId: message.threadId }
    })
    notification.onclick = this.handleNotificationClicked
    return notification
  }

  /**
  * Handles a notification being clicked
  * @param evt: the event that fired
  */
  handleNotificationClicked (evt) {
    if (evt.target && evt.target.data) {
      const data = evt.target.data
      if (data.mailbox) {
        ipcRenderer.send('focus-app', { })
        flux.mailbox.A.changeActive(data.mailbox)
        mailboxDispatch.openMessage(data.mailbox, data.threadId, data.messageId)
      }
    }
  }
}

module.exports = UnreadNotifications
