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
    // Pull the pending notifications out from each one
    const notifications = store.all().reduce((acc, mailbox) => {
      const threads = mailbox.google.unotifiedUnread
      if (threads.length) {
        // We're in a dispatch cycle, so requeue this in it's own context
        const notifiedData = threads.map(thread => {
          return { id: thread.id, historyId: thread.historyId, time: new Date().getTime() }
        })
        setTimeout(function () {
          flux.mailbox.A.setGoogleUnreadNotified(mailbox.id, notifiedData)
        })

        // Prep the notification content
        if (mailbox.showNotifications) {
          return acc.concat(threads.map(thread => {
            return { mailbox: mailbox, thread: thread }
          }))
        }
      }

      return acc
    }, [])

    notifications.forEach(({ mailbox, thread }) => {
      // Decode the snippet
      let snippet = 'No Body'
      if (thread.snippet) {
        const decoder = document.createElement('div')
        decoder.innerHTML = thread.snippet
        snippet = decoder.textContent
      }

      // Build the notification
      const notification = new window.Notification('New Message', {
        body: [ mailbox.email, snippet ].join('\n'),
        data: { mailbox: mailbox.id, thread: thread.id }
      })
      notification.onclick = this.handleNotificationClicked
    })
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
