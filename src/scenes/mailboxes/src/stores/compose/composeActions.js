const alt = require('../alt')
const { ipcRenderer } = window.nativeRequire('electron')
const URI = require('urijs')
const addressparser = require('addressparser')

class ComposeActions {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  load () {
    return {}
  }

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

  /**
  * Opens a mailto link
  * @param mailtoLink='': the link to try to open
  */
  processMailtoLink (mailtoLink = '') {
    if (mailtoLink.indexOf('mailto:') === 0) {
      const uri = URI(mailtoLink || '')
      const recipients = addressparser(decodeURIComponent(uri.pathname())).map((r) => r.address)
      const qs = uri.search(true)
      return this.composeNewMessage(recipients.join(','), qs.subject || qs.Subject, qs.body || qs.Body)
    } else {
      return { valid: false }
    }
  }
}

const actions = alt.createActions(ComposeActions)
ipcRenderer.on('open-mailto-link', (evt, req) => actions.processMailtoLink(req.mailtoLink))
module.exports = actions
