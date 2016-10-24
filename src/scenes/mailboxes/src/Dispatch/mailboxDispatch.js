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
  * @return promise
  */
  request (name, args = undefined) {
    if (!this.__responders__[name] || this.__responders__[name].length === 0) {
      return Promise.resolve([])
    }
    return Promise.all(this.__responders__[name].map((fn) => fn(args)))
  }

  /* **************************************************************************/
  // Event Fires
  /* **************************************************************************/

  /**
  * Emits a open dev tools command
  * @param mailboxId: the id of the mailbox
  */
  openDevTools (mailboxId) {
    this.emit('devtools', { mailboxId: mailboxId })
  }

  /**
  * Emits a focus event for a mailbox
  * @param mailboxId=undefined: the id of the mailbox
  */
  refocus (mailboxId = undefined) {
    this.emit('refocus', { mailboxId: mailboxId })
  }

  /**
  * Reloads a mailbox
  * @param mailboxId: the id of mailbox
  */
  reload (mailboxId) {
    this.emit('reload', { mailboxId: mailboxId })
  }

  /**
  * Emis a blurred event for a mailbox
  * @param mailboxId: the id of the mailbox
  */
  blurred (mailboxId) {
    this.emit('blurred', { mailboxId: mailboxId })
  }

  /**
  * Emis a focused event for a mailbox
  * @param mailboxId: the id of the mailbox
  */
  focused (mailboxId) {
    this.emit('focused', { mailboxId: mailboxId })
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
