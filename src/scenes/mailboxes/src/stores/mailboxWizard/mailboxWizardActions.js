const alt = require('../alt')
const { ipcRenderer } = window.nativeRequire('electron')
const { Mailbox } = require('shared/Models/Mailbox')

class MailboxWizardActions {

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * Loads any start off services
  */
  load () { return {} }

  /* **************************************************************************/
  // Adding
  /* **************************************************************************/

  /**
  * Opens the add mailbox picker
  */
  openAddMailbox () { return {} }

  /**
  * Dismisses the add mailbox picker
  */
  cancelAddMailbox () { return {} }

  /**
  * Starts the auth process for google inbox
  */
  authenticateGinboxMailbox () {
    return { provisionalId: Mailbox.provisionId() }
  }

  /**
  * Starts the auth process for gmail
  */
  authenticateGmailMailbox () {
    return { provisionalId: Mailbox.provisionId() }
  }

  /* **************************************************************************/
  // Authentication callbacks
  /* **************************************************************************/

  /**
  * Handles a mailbox authenticating
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  authGoogleMailboxSuccess (evt, data) {
    return { provisionalId: data.id, type: data.type, auth: data.auth }
  }

  /**
  * Handles a mailbox authenticating error
  * @param evt: the ipc event that fired
  * @param data: the data that came across the ipc
  */
  authGoogleMailboxFailure (evt, data) {
    return { evt: evt, data: data }
  }

  /* **************************************************************************/
  // Config
  /* **************************************************************************/

  /**
  * Configures an account
  * @param configuration: the additional configuration to provide
  */
  configureMailbox (configuration) {
    return { configuration: configuration }
  }

  /**
  * Completes mailbox configuration
  */
  configurationComplete () { return {} }
}

const actions = alt.createActions(MailboxWizardActions)
ipcRenderer.on('auth-google-complete', actions.authGoogleMailboxSuccess)
ipcRenderer.on('auth-google-error', actions.authGoogleMailboxFailure)

module.exports = actions
