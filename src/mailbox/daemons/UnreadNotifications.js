const flux = {
  mailbox: require('../stores/mailbox'),
  settings: require('../stores/settings')
}
const constants = require('shared/constants')

class UnreadNotifications {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.__s_mailboxesUpdated = (store) => this.mailboxesUpdated(store)
    this.__constructTime__ = new Date().getTime()
    this.__dispatching__ = false
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
    if (flux.settings.S.getState().notificationsEnabled() === false) { return }
    const firstRun = new Date().getTime() - this.__constructTime__ < constants.GMAIL_NOTIFICATION_FIRST_RUN_GRACE_MS
    const firedList = {}
    let fired = false

    store.all().forEach((mailbox) => {
      if (!mailbox.showNotifications) { return }
      const unread = mailbox.google.unreadUnotifiedMessages

      for (var messageId in unread) {
        // Fire the notification
        if (!firstRun) {
          this.showNotification(mailbox, unread[messageId].message)
        }

        // Set that we've fired
        fired = true
        if (!firedList[mailbox.id]) {
          firedList[mailbox.id] = []
        }
        firedList[mailbox.id].push(messageId)
      }
    })

    // We're in a dispatch cycle so requeue this in its own context
    if (fired) {
      this.__dispatching__ = true
      const classThis = this
      setTimeout(function () {
        Object.keys(firedList).forEach((mailboxId) => {
          flux.mailbox.A.setGoogleUnreadNotificationsShown(mailboxId, firedList[mailboxId])
        })
        classThis.__dispatching__ = false
        classThis.mailboxesUpdated(flux.mailbox.S.getState())
      })
    }
  }

  /**
  * Shows a notification
  * @param mailbox: the mailbox to show it for
  * @param message: the message notification to show
  * @return the notification
  */
  showNotification (mailbox, message) {
    const subject = (message.payload.headers.find((h) => h.name === 'Subject') || {}).value || 'No Subject'
    const fromEmail = (message.payload.headers.find((h) => h.name === 'From') || {}).value || ''

    // Extract the body
    let snippet = 'No Body'
    if (message.snippet) {
      const decoder = document.createElement('div')
      decoder.innerHTML = message.snippet
      snippet = decoder.textContent
    }

    const notification = new window.Notification(subject, {
      body: [fromEmail, snippet].join('\n'),
      silent: flux.settings.S.getState().notificationsSilent,
      data: { mailbox: mailbox.id, messageId: message.id }
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
        flux.mailbox.A.changeActive(data.mailbox)
      }
    }
  }
}

module.exports = UnreadNotifications
