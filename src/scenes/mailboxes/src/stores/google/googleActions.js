const alt = require('../alt')
const mailboxStore = require('../mailbox/mailboxStore')
const { Mailbox } = require('shared/Models/Mailbox')
const { ipcRenderer } = window.nativeRequire('electron')

class GoogleActions {

  /* **************************************************************************/
  // Pollers
  /* **************************************************************************/

  /**
  * Starts polling the server for updates on a periodic basis
  */
  startPollingUpdates () {
    return {}
  }

  /**
  * Stops polling the server for updates
  */
  stopPollingUpdates () {
    return {}
  }

  /* **************************************************************************/
  // User Auth
  /* **************************************************************************/

  /**
  * Starts the auth process for google inbox
  */
  authInboxMailbox () {
    return { provisionalId: Mailbox.provisionId() }
  }

  /**
  * Starts the auth process for gmail
  */
  authGmailMailbox () {
    return { provisionalId: Mailbox.provisionId() }
  }

  /**
  * Handles a mailbox authenticating
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  authMailboxSuccess (evt, data) {
    return { provisionalId: data.id, type: data.type, auth: data.auth }
  }

  /**
  * Handles a mailbox authenticating error
  * @param evt: the ipc event that fired
  * @param data: the data that came across the ipc
  */
  authMailboxFailure (evt, data) {
    return { evt: evt, data: data }
  }

  /* **************************************************************************/
  // Profiles
  /* **************************************************************************/

  /**
  * Syncs all profiles
  */
  syncAllMailboxProfiles () {
    const mailboxIds = mailboxStore.getState().mailboxIds()
    if (mailboxIds.length === 0) { return { promise: Promise.resolve() } }

    mailboxIds.forEach((mailboxId) => { this.syncMailboxProfile.defer(mailboxId) })
    return {}
  }

  /**
  * Syncs a mailbox profile
  * @param mailboxId: the id of the mailbox
  */
  syncMailboxProfile (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /**
  * Deals with a mailbox sync completing
  * @param mailboxId: the id of the mailbox
  */
  syncMailboxProfileSuccess (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /**
  * Deals with a mailbox sync completing
  * @param mailboxId: the id of the mailbox
  * @param err: the error from the api
  */
  syncMailboxProfileFailure (mailboxId, err) {
    return { mailboxId: mailboxId, err: err }
  }

  /* **************************************************************************/
  // Unread Counts
  /* **************************************************************************/

  /**
  * Syncs all profiles
  * @param forceFullSync=false: set to true to avoid the cursory check
  */
  syncAllMailboxUnreadCounts (forceFullSync = false) {
    const mailboxIds = mailboxStore.getState().mailboxIds()
    if (mailboxIds.length === 0) { return { promise: Promise.resolve() } }

    mailboxIds.forEach((mailboxId) => this.syncMailboxUnreadCount.defer(mailboxId, forceFullSync))
    return {}
  }

  /**
  * Syncs the unread count for a set of mailboxes
  * @param mailboxId: the id of the mailbox
  * @param forceFullSync=false: set to true to avoid the cursory check
  */
  syncMailboxUnreadCount (mailboxId, forceFullSync = false) {
    return { mailboxId: mailboxId, forceFullSync: forceFullSync }
  }

  /**
  * Suggests that the store should sync an unread count, but could not be required
  * @param mailboxId: the id of the mailbox
  */
  suggestSyncMailboxUnreadCount (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /**
  * Deals with a mailbox unread count completing
  * @param mailboxId: the id of the mailbox
  */
  syncMailboxUnreadCountSuccess (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /**
  * Deals with a mailbox unread count erroring
  * @param mailboxId: the id of the mailbox
  * @param err: the error from the api
  */
  syncMailboxUnreadCountFailure (mailboxId, err) {
    return { mailboxId: mailboxId, err: err }
  }
}

// Bind the IPC listeners
const actions = alt.createActions(GoogleActions)
ipcRenderer.on('auth-google-complete', actions.authMailboxSuccess)
ipcRenderer.on('auth-google-error', actions.authMailboxFailure)

module.exports = actions
