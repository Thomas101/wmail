const alt = require('../alt')
const { ipcRenderer, remote } = window.nativeRequire('electron')
const { session } = remote
const mailboxDispatch = require('../../Dispatch/mailboxDispatch')
const Mailbox = require('shared/Models/Mailbox/Mailbox')

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
  * @param updatesOrPath: an object indicating the updates to apply or the path string to apply to
  * @param valueOrUndef: if path is set, the value to set
  */
  update (id, updatesOrPath, valueOrUndef) {
    if (typeof (updatesOrPath) === 'string') {
      return { id: id, updates: undefined, path: updatesOrPath, value: valueOrUndef }
    } else {
      return { id: id, updates: updatesOrPath, path: undefined, value: undefined }
    }
  }

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

  /**
  * Sets the basic profile info
  * @param id: the mailbox id
  * @param email: the users email address
  * @param name: the accounts display name
  * @param avatar: the accounts avatar
  */
  setBasicProfileInfo (id, email, name, avatar) {
    return this.update(id, {
      avatar: avatar,
      email: email,
      name: name
    })
  }

  /**
  * Sets the custom css
  * @param id: the mailbox id
  * @param css: the css code
  */
  setCustomCSS (id, css) {
    return this.update(id, { customCSS: css })
  }

  /**
  * Sets the custom js
  * @param id: the mailbox id
  * @param js: the js code
  */
  setCustomJS (id, js) {
    return this.update(id, { customJS: js })
  }

  /**
  * Artificially persist the cookies for this mailbox
  * @param id: the mailbox id
  * @param persist: whether to persist the cookies
  */
  artificiallyPersistCookies (id, persist) {
    return this.update(id, { artificiallyPersistCookies: persist })
  }

  /* **************************************************************************/
  // Updating: Zoom
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
  * Sets the google unread count info
  * @param id: the id of the mailbox
  * @param countInfo: the info provided by google
  */
  setGoogleLabelInfo (id, info) {
    return this.update(id, Object.keys(info).reduce((acc, key) => {
      acc['googleLabelInfo_v2.' + key] = info[key]
      return acc
    }, {}))
  }

  /**
  * Sets the latest unread thread list
  * @param id: the id of the mailbox
  * @param threadList: the list of threads as an array
  * @param fetchedThreads: the full threads that have been fetched sent as an object keyed by id
  */
  setGoogleLatestUnreadThreads (id, threadList, fetchedThreads) {
    return { id: id, threadList: threadList, fetchedThreads: fetchedThreads }
  }

  /**
  * Sets the last fired history id
  * @param id: the id of the mailbox
  * @param historyId: the last historyId
  */
  setGoogleLastNotifiedInternalDate (id, internalDate) {
    return this.update(id, 'googleUnreadMessageInfo_v2.lastNotifiedInternalDate', parseInt(internalDate))
  }

  /* **************************************************************************/
  // Active
  /* **************************************************************************/

  /**
  * Changes the active mailbox
  * @param id: the id of the mailbox
  * @param service=default: the service to change to
  */
  changeActive (id, service = Mailbox.SERVICES.DEFAULT) {
    return { id: id, service: service }
  }

  /**
  * Changes the active mailbox to the previous in the list
  */
  changeActiveToPrev () { return {} }

  /**
  * Changes the active mailbox to the next in the list
  */
  changeActiveToNext () { return {} }

  /* **************************************************************************/
  // Search
  /* **************************************************************************/

  /**
  * Starts searching the mailbox
  * @param id: the mailbox id
  * @param service: the type of service to search for
  */
  startSearchingMailbox (id, service) {
    return {id: id, service: service}
  }

  /**
  * Stops searching the mailbox
  * @param id: the mailbox id
  * @param service: the type of service to stop search for
  */
  stopSearchingMailbox (id, service) {
    return {id: id, service: service}
  }

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

  /* **************************************************************************/
  // Auth
  /* **************************************************************************/

  /**
  * Reauthenticates the user by logging them out of the webview
  * @param id: the id of the mailbox
  */
  reauthenticateBrowserSession (id) {
    const ses = session.fromPartition('persist:' + id)
    const promise = Promise.resolve()
      .then(() => {
        return new Promise((resolve) => {
          ses.clearStorageData(resolve)
        })
      })
      .then(() => {
        return new Promise((resolve) => {
          ses.clearCache(resolve)
        })
      })
      .then(() => {
        mailboxDispatch.reload(id)
        return Promise.resolve()
      })

    return { promise: promise }
  }

}

const actions = alt.createActions(MailboxActions)
ipcRenderer.on('mailbox-zoom-in', actions.increaseActiveZoom)
ipcRenderer.on('mailbox-zoom-out', actions.decreaseActiveZoom)
ipcRenderer.on('mailbox-zoom-reset', actions.resetActiveZoom)
ipcRenderer.on('mailbox-window-find-start', () => actions.startSearchingMailbox())
ipcRenderer.on('switch-mailbox', (evt, req) => {
  if (req.mailboxId) {
    actions.changeActive(req.mailboxId)
  } else if (req.prev) {
    actions.changeActiveToPrev()
  } else if (req.next) {
    actions.changeActiveToNext()
  }
})

module.exports = actions
