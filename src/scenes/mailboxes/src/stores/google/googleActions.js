const alt = require('../alt')
const mailboxStore = require('../mailbox/mailboxStore')

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

module.exports = alt.createActions(GoogleActions)
