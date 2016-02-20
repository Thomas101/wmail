const alt = require('../alt')
const actions = require('./mailboxActions')
const storage = require('../storage')
const Mailbox = require('./Mailbox')
const { GMAIL_NOTIFICATION_MESSAGE_CLEANUP_AGE_MS } = require('shared/constants')

const INDEX_KEY = 'Mailbox_index'
const MAILBOX_KEY = function (id) { return 'Mailbox_' + id }

class MailboxStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.index = []
    this.mailboxes = new Map()
    this.active = null

    /* ****************************************/
    // Fetching Mailboxes
    /* ****************************************/

    /**
    * @return all the mailboxes in order
    */
    this.all = () => { return this.ids().map(id => this.mailboxes.get(id)) }

    /**
    * @return the ids
    */
    this.ids = () => { return Array.from(this.index) }

    /**
    * @return the mailbox
    */
    this.get = (id) => { return this.mailboxes.get(id) || null }

    /**
    * @return the index of the given mailbox id
    */
    this.indexOf = (id) => { return this.index.findIndex(i => i === id) }

    /**
    * @return true if it is the first mailbox
    */
    this.isFirst = (id) => { return this.indexOf(id) === 0 }

    /**
    * @return true if it is the last mailbox
    */
    this.isLast = (id) => { return this.indexOf(id) === this.index.length - 1 }

    /**
    * @return true if the store has this item
    */
    this.has = (id) => { return this.indexOf(id) !== -1 }

    /* ****************************************/
    // Active
    /* ****************************************/

    /**
    * @return the id of the active mailbox
    */
    this.activeId = () => { return this.active }

    /**
    * @return the active mailbox
    */
    this.active = () => { return this.mailboxes.get(this.active) }

    /* ****************************************/
    // Aggregated queries
    /* ****************************************/

    /**
    * @return the total amount of unread items
    */
    this.totalUnreadCount = () => {
      return this.all().reduce((acc, mailbox) => {
        if (mailbox && !isNaN(mailbox.unread)) {
          acc += mailbox.unread
        }
        return acc
      }, 0)
    }

    /**
    * @return the total amount of unread items taking mailbox settings into account
    */
    this.totalUnreadCountForAppBadge = () => {
      return this.all().reduce((acc, mailbox) => {
        if (mailbox && !isNaN(mailbox.unread) && mailbox.unreadCountsTowardsAppUnread) {
          acc += mailbox.unread
        }
        return acc
      }, 0)
    }

    this.bindListeners({
      handleLoad: actions.LOAD,
      handleCreate: actions.CREATE,
      handleRemove: actions.REMOVE,
      handleUpdate: actions.UPDATE,

      handleChangeActive: actions.CHANGE_ACTIVE,

      handleMoveUp: actions.MOVE_UP,
      handleMoveDown: actions.MOVE_DOWN,

      handleUpdateGoogleConfig: actions.UPDATE_GOOGLE_CONFIG,
      handleUpdateGoogleUnread: actions.UPDATE_GOOGLE_UNREAD,
      handleSetGoogleUnreadNotificationShown: actions.SET_GOOGLE_UNREAD_NOTIFICATION_SHOWN
    })
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Saves a mailbox
  * @param id: the id of the mailbox
  * @param data: the mailbox data
  */
  saveMailbox (id, data) {
    storage.set(MAILBOX_KEY(id), data)
    this.mailboxes.set(id, new Mailbox(id, data))
  }

  /* **************************************************************************/
  // Handlers CRUD
  /* **************************************************************************/

  /**
  * Loads the storage from disk
  */
  handleLoad () {
    this.index = storage.get(INDEX_KEY, [])
    this.index.forEach(k => {
      this.mailboxes.set(k, new Mailbox(k, storage.get(MAILBOX_KEY(k), null)))
    })
    this.active = this.index[0] || null
  }

  /**
  * Creates a new mailbox
  * @param id: the id of the mailbox
  * @param data: the data to seed the mailbox with
  */
  handleCreate ({id, data}) {
    this.saveMailbox(id, data)
    this.index.push(id)
    storage.set(INDEX_KEY, this.index)
    this.active = id
  }

  /**
  * Removes an item
  * @param id: the id to remove
  */
  handleRemove ({id}) {
    const wasActive = this.active === id
    this.index = this.index.filter(i => i !== id)
    storage.set(INDEX_KEY, this.index)
    this.mailboxes.delete(id)
    storage.remove(MAILBOX_KEY(id), id)

    if (wasActive) {
      this.active = this.index[0]
    }
  }

  /**
  * Handles a mailbox updating
  * @param id: the id of the tem
  * @param updates: the updates to merge in
  */
  handleUpdate ({id, updates}) {
    const mailbox = this.mailboxes.get(id)
    const data = Object.assign(mailbox.cloneData(), updates)
    this.saveMailbox(id, data)
  }

  /* **************************************************************************/
  // Handlers : Active & Ordering
  /* **************************************************************************/

  /**
  * Handles the active mailbox changing
  * @param id: the id of the mailbox
  */
  handleChangeActive ({id}) {
    this.active = id
  }

  /**
  * Handles moving the given mailbox id up
  */
  handleMoveUp ({id}) {
    const mailboxIndex = this.index.findIndex(i => i === id)
    if (mailboxIndex !== -1 && mailboxIndex !== 0) {
      this.index.splice(mailboxIndex - 1, 0, this.index.splice(mailboxIndex, 1)[0])
      storage.set(INDEX_KEY, this.index)
    }
  }

  /**
  * Handles moving the given mailbox id down
  */
  handleMoveDown ({id}) {
    const mailboxIndex = this.index.findIndex(i => i === id)
    if (mailboxIndex !== -1 && mailboxIndex < this.index.length) {
      this.index.splice(mailboxIndex + 1, 0, this.index.splice(mailboxIndex, 1)[0])
      storage.set(INDEX_KEY, this.index)
    }
  }

  /* **************************************************************************/
  // Handlers : Google
  /* **************************************************************************/

  /**
  * Handles the google config updating
  * @param id: the id of the tem
  * @param updates: the updates to merge in
  */
  handleUpdateGoogleConfig ({id, updates}) {
    const data = this.mailboxes.get(id).cloneData()
    data.googleConf = Object.assign(data.googleConf || {}, updates)
    this.saveMailbox(id, data)
  }

  /**
  * Merges the google unread items and removes any flags for updated ites
  * @param id: the id of the mailbox
  * @param messageId: the id of the message
  * @param updates: the updates to apply
  */
  handleUpdateGoogleUnread ({id, messageId, updates}) {
    const data = this.mailboxes.get(id).cloneData()
    data.googleUnreadMessages = data.googleUnreadMessages || {}

    // Add the update
    const now = new Date().getTime()
    if (data.googleUnreadMessages[messageId]) {
      data.googleUnreadMessages[messageId] = Object.assign(
        data.googleUnreadMessages[messageId],
        { seen: now },
        updates)
    } else {
      data.googleUnreadMessages[messageId] = Object.assign({
        recordCreated: now, seen: now
      }, updates)
    }

    // Clean up old records
    data.googleUnreadMessages = Object.keys(data.googleUnreadMessages).reduce((acc, messageId) => {
      const rec = data.googleUnreadMessages[messageId]
      if (now - rec.seen < GMAIL_NOTIFICATION_MESSAGE_CLEANUP_AGE_MS) {
        acc[messageId] = rec
      }
      return acc
    }, {})

    this.saveMailbox(id, data)
  }

  /**
  * Sets that the given thread ids have sent notifications
  * @param id: the id of the mailbox
  * @param messageId: the id of the message to mark
  */
  handleSetGoogleUnreadNotificationShown ({id, messageId}) {
    const data = this.mailboxes.get(id).cloneData()
    data.googleUnreadMessages = data.googleUnreadMessages || {}

    const now = new Date().getTime()
    if (data.googleUnreadMessages[messageId]) {
      data.googleUnreadMessages[messageId].notified = now
      data.googleUnreadMessages[messageId].seen = now
    }

    // Clean up old records
    data.googleUnreadMessages = Object.keys(data.googleUnreadMessages).reduce((acc, messageId) => {
      const rec = data.googleUnreadMessages[messageId]
      if (now - rec.seen < GMAIL_NOTIFICATION_MESSAGE_CLEANUP_AGE_MS) {
        acc[messageId] = rec
      }
      return acc
    }, {})

    this.saveMailbox(id, data)
  }

}

module.exports = alt.createStore(MailboxStore, 'MailboxStore')
