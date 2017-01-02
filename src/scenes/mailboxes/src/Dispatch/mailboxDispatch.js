const Minivents = require('minivents')

class MailboxDispatch {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.__responders__ = {}
    Minivents(this)
  }

  /* **************************************************************************/
  // Responders
  /* **************************************************************************/

  /**
  * Adds a responder
  * @param name: the name of the responder
  * @param fn: the function to respond with
  */
  respond (name, fn) {
    if (this.__responders__[name]) {
      this.__responders__[name].push(fn)
    } else {
      this.__responders__[name] = [fn]
    }
  }

  /**
  * Unregisteres a responder
  * @param name: the name of the responder
  * @param fn: the function to remove
  */
  unrespond (name, fn) {
    if (this.__responders__[name]) {
      this.__responders__[name] = this.__responders__[name].filter((f) => f !== fn)
    }
  }

  /**
  * Makes a fetch to a set of responders
  * @param name: the name of the responder to call
  * @param args=undefined: arguments to pass to the responders
  * @param timeout=undefined: set to a ms to provide a timeout
  * @return promise
  */
  request (name, args = undefined, timeout = undefined) {
    if (!this.__responders__[name] || this.__responders__[name].length === 0) {
      return Promise.resolve([])
    }

    const requestPromise = Promise.all(this.__responders__[name].map((fn) => fn(args)))
    if (timeout === undefined) {
      return requestPromise
    } else {
      return Promise.race([
        requestPromise,
        new Promise((resolve, reject) => {
          setTimeout(() => reject({ timeout: true }), timeout)
        })
      ])
    }
  }

  /* **************************************************************************/
  // Responders : Higher level
  /* **************************************************************************/

  /**
  * Fetches the process memory info for all webviews
  * @return promise with the array of infos
  */
  fetchProcessMemoryInfo () {
    return this.request('fetch-process-memory-info')
  }

  /**
  * Fetches the gmail unread count
  * @param mailboxId: the id of the mailbox
  * @return promise with the unread count or undefined
  */
  fetchGmailUnreadCount (mailboxId) {
    return this.request('get-google-unread-count:' + mailboxId, {}, 1000)
      .then((responses) => {
        return Promise.resolve((responses[0] || {}))
      })
  }

  /**
  * Fetches the gmail unread count and retries on timeout
  * @param mailboxId: the id of the mailbox
  * @param maxRetries=30: the number of retries to attempt. A second between each
  * @return promise with the unread count or undefined
  */
  fetchGmailUnreadCountWithRetry (mailboxId, maxRetries = 30) {
    return new Promise((resolve, reject) => {
      const tryFetch = (tries) => {
        this.fetchGmailUnreadCount(mailboxId).then(
          (res) => resolve(res),
          (err) => {
            if (err.timeout && tries < maxRetries) {
              setTimeout(() => tryFetch(tries + 1), 1000)
            } else {
              reject(err)
            }
          })
      }
      tryFetch(0)
    })
  }

  /* **************************************************************************/
  // Event Fires
  /* **************************************************************************/

  /**
  * Emits a open dev tools command
  * @param mailboxId: the id of the mailbox
  * @param service: the service to open for
  */
  openDevTools (mailboxId, service) {
    this.emit('devtools', { mailboxId: mailboxId, service: service })
  }

  /**
  * Emits a focus event for a mailbox
  * @param mailboxId=undefined: the id of the mailbox
  * @param service=undefined: the service of the mailbox
  */
  refocus (mailboxId = undefined, service = undefined) {
    this.emit('refocus', { mailboxId: mailboxId, service: service })
  }

  /**
  * Reloads a mailbox
  * @param mailboxId: the id of mailbox
  * @param service: the service of the mailbox
  */
  reload (mailboxId, service) {
    this.emit('reload', { mailboxId: mailboxId, service: service, allServices: false })
  }

  /**
  * Reloads all mailboxes services with the given id
  * @param mailboxId: the id of mailbox
  */
  reloadAllServices (mailboxId) {
    this.emit('reload', { mailboxId: mailboxId, allServices: true })
  }

  /**
  * Emis a blurred event for a mailbox
  * @param mailboxId: the id of the mailbox
  * @param service: the service of the mailbox
  */
  blurred (mailboxId, service) {
    this.emit('blurred', { mailboxId: mailboxId, service: service })
  }

  /**
  * Emis a focused event for a mailbox
  * @param mailboxId: the id of the mailbox
  * @param service: the service of the mailbox
  */
  focused (mailboxId, service) {
    this.emit('focused', { mailboxId: mailboxId, service: service })
  }

  /**
  * Emits an open message event for a mailbox
  * @param mailboxId: the id of the mailbox
  * @param threadId: the id of the thread
  * @param messageId: the id of the message to open
  */
  openMessage (mailboxId, threadId, messageId) {
    this.emit('openMessage', {
      mailboxId: mailboxId,
      threadId: threadId,
      messageId: messageId
    })
  }
}

module.exports = new MailboxDispatch()
