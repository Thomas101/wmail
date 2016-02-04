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
        setTimeout(function () {
          flux.mailbox.A.setGoogleUnreadNotified(mailbox.id, threads.map(thread => thread.id))
        })

        if (mailbox.showNotifications) {
          return acc.concat(threads.map(thread => {
            return {
              title: 'New Message',
              body: [
                'Account: ' + mailbox.email,
                thread.snippet || 'No Body'
              ].join('\n'),
              data: { mailbox: mailbox.id, thread: thread.id }
            }
          }))
        }
      }

      return acc
    }, [])

    notifications.forEach(data => {
      const notification = new window.Notification(data.title, data)
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
