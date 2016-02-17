const flux = {
  mailbox: require('../stores/mailbox')
}

class UnreadNotifications {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.__s_mailboxesUpdated = (store) => this.mailboxesUpdated(store)
  }

  /**
  * Starts listening for changes
  */
  start () {
    flux.mailbox.S.listen(this.__s_mailboxesUpdated)
    this.mailboxesUpdated(flux.mailbox.S.getState())
  }

  /**
  * Stops listening for changes
  */
  stop () {
    flux.mailbox.S.unlisten(this.__s_mailboxesUpdated)
  }

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  /**
  * Handles the mailboxes changing by dropping out any notifications
  */
  mailboxesUpdated (store) {
    store.all().forEach(mailbox => {
      if (!mailbox.showNotifications) { return }
      const unread = mailbox.google.unreadUnotifiedMessages

      for (var messageId in unread) {
        this.showNotification(mailbox, unread[messageId].message)
        // We're in a dispatch cycle, so requeue this in it's own context
        setTimeout(function () {
          flux.mailbox.A.setGoogleUnreadNotificationShown(mailbox.id, messageId)
        })
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
    const subject = (message.payload.headers.find(h => h.name === 'Subject') || {}).value || 'No Subject'
    const fromEmail = (message.payload.headers.find(h => h.name === 'From') || {}).value || ''

    // Extract the body
    let snippet = 'No Body'
    if (message.snippet) {
      const decoder = document.createElement('div')
      decoder.innerHTML = message.snippet
      snippet = decoder.textContent
    }

    const notification = new window.Notification(subject, {
      body: [fromEmail, snippet].join('\n'),
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
