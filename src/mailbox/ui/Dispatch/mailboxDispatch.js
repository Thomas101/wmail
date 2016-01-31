const Minivents = require('minivents')

class MailboxDispatch {
  /**
  * Emits a reload command
  * @param mailboxId: the id of the mailbox
  */
  reload (mailboxId) {
    this.emit('reload', { mailboxId: mailboxId })
  }

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

}

const mailboxDispatch = new MailboxDispatch()
Minivents(mailboxDispatch)
module.exports = mailboxDispatch
