const alt = require('../alt')
const {ipcRenderer} = window.nativeRequire('electron')

class MailboxActions {

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  /**
  * Indicates the store to drop all data and load from disk
  */
  load () { return {} }

  /* **************************************************************************/
  // Create & Remove
  /* **************************************************************************/

  /**
  * Creates a new mailbox
  * @param id: the id of the mailbox
  * @param data: the data to create it with
  */
  create (id, data) { return { id: id, data: data } }

  /**
  * Removes a mailbox
  * @param id: the id of the mailbox to update
  */
  remove (id) { return { id: id } }

  /* **************************************************************************/
  // Updating
  /* **************************************************************************/

  /**
  * Updates a mailbox
  * @param id: the id of the mailbox
  * @param updates: the updates to apply
  */
  update (id, updates) { return { id: id, updates: updates } }

  /**
  * Sets a custom avatar
  * @param id: the id of the mailbox
  * @param b64Image: the image to set
  */
  setCustomAvatar (id, b64Image) { return { id: id, b64Image: b64Image } }

  /**
  * @param id: the id of the mailbox
  * @param show: sets whether to show the unread badge or not
  */
  setShowUnreadBage (id, show) {
    return this.update(id, { showUnreadBadge: show })
  }

  /**
  * @param id: the id of the mailbox
  * @param show: sets whether to show notifications or not
  */
  setShowNotifications (id, show) {
    return this.update(id, { showNotifications: show })
  }

  /**
  * @param id: the id of the mailbox
  * @param doesCount: sets whther the unread counts do count towards the app unread badge
  */
  setUnreadCountsTowardsAppUnread (id, doesCount) {
    return this.update(id, { unreadCountsTowardsAppUnread: doesCount })
  }

  /**
  * @param id: the id of the mailbox
  * @param col: the color as either a hex string or object that contains hex key
  */
  setColor (id, col) {
    if (typeof (col) === 'object') {
      col = col.hex
    }
    return this.update(id, { color: col })
  }

  /* **************************************************************************/
  // Updating: Active
  /* **************************************************************************/

  /**
  * Increases the zoom of the active mailbox
  */
  increaseActiveZoom () { return {} }

  /**
  * Decreases the zoom of the active mailbox
  */
  decreaseActiveZoom () { return {} }

  /**
  * Resets the zoom of the the active mailbox
  */
  resetActiveZoom () { return {} }

  /* **************************************************************************/
  // Google
  /* **************************************************************************/

  /**
  * Updates the google config inside a mailbox
  * @param id: the id of the mailbox
  * @param updates: the updates to apply
  */
  updateGoogleConfig (id, updates) { return { id: id, updates: updates } }

  /**
  * Updates the google unread threads
  * @param id: the id of the mailbox
  * @param messageIdsOrMessageId: the ids of the messages or a single id
  * @param updates: the updates to merge in
  */
  updateGoogleUnread (id, messageIdsOrMessageId, updates) {
    if (Array.isArray(messageIdsOrMessageId)) {
      return { id: id, messageIds: messageIdsOrMessageId, updates: updates }
    } else {
      return { id: id, messageIds: [messageIdsOrMessageId], updates: updates }
    }
  }

  /**
  * Sets the current list of unread messages. Also marks the list as seen
  * @param id: the id of the mailbox
  * @param messageIds: the ids of the messages that are currently unread
  */
  setGoogleUnreadMessageIds (id, messageIds) {
    return { id: id, messageIds: messageIds }
  }

  /**
  * Sets all the google messages as read
  * @param id: the id of the mailbox
  */
  setAllGoogleMessagesRead (id) {
    return { id: id }
  }

  /**
  * Sets that a thread has sent a notification
  * @param id: the id of the mailbox
  * @param messageIds: the ids of the messages
  */
  setGoogleUnreadNotificationsShown (id, messageIds) { return { id: id, messageIds: messageIds } }

  /* **************************************************************************/
  // Active
  /* **************************************************************************/

  /**
  * Changes the active mailbox
  */
  changeActive (id) { return { id: id } }

  /* **************************************************************************/
  // Ordering
  /* **************************************************************************/

  /**
  * Moves a mailbox up in the index
  * @param id: the id of the mailbox
  */
  moveUp (id) { return { id: id } }

  /**
  * Moves a mailbox down in the index
  * @param id: the id of the mailbox
  */
  moveDown (id) { return { id: id } }

}

const actions = alt.createActions(MailboxActions)
ipcRenderer.on('mailbox-zoom-in', actions.increaseActiveZoom)
ipcRenderer.on('mailbox-zoom-out', actions.decreaseActiveZoom)
ipcRenderer.on('mailbox-zoom-reset', actions.resetActiveZoom)
ipcRenderer.on('switch-mailbox', (evt, req) => actions.changeActive(req.mailboxId))

module.exports = actions
