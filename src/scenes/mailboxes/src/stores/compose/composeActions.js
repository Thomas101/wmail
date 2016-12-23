const alt = require('../alt')

class ComposeActions {

  /* **************************************************************************/
  // New Message
  /* **************************************************************************/

  /**
  * Composes a new message
  * @param recipient=undefined: the recipient to send to
  * @param subject=undefined: the subject of the message
  * @param body=undefined: the body of the message
  */
  composeNewMessage (recipient = undefined, subject = undefined, body = undefined) {
    return { recipient: recipient, subject: subject, body: body }
  }

  /**
  * Clears the current compose
  */
  clearCompose () {
    return {}
  }

  /**
  * Sets the target mailbox
  * @param mailboxId: the id of the mailbox
  */
  setTargetMailbox (mailboxId) {
    return { mailboxId: mailboxId }
  }
}

module.exports = alt.createActions(ComposeActions)
