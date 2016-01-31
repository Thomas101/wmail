const alt = require('../alt')
const actions = require('./mailboxActions')
const storage = require('../storage')
const Mailbox = require('./Mailbox')

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

    this.bindListeners({
      handleLoad: actions.LOAD,
      handleCreate: actions.CREATE,
      handleRemove: actions.REMOVE,
      handleUpdate: actions.UPDATE,
      handleUpdateGoogleConfig: actions.UPDATE_GOOGLE_CONFIG,
      handleChangeActive: actions.CHANGE_ACTIVE,
      handleMoveUp: actions.MOVE_UP,
      handleMoveDown: actions.MOVE_DOWN
    })
  }

  /* **************************************************************************/
  // Handlers
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
    const mailbox = new Mailbox(id, data)
    storage.set(MAILBOX_KEY(id), data)
    this.mailboxes.set(id, mailbox)

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
    const data = Object.assign({}, mailbox.__data__, updates)
    storage.set(MAILBOX_KEY(id), data)
    this.mailboxes.set(id, new Mailbox(id, data))
  }

  /**
  * Handles the google config updating
  * @param id: the id of the tem
  * @param updates: the updates to merge in
  */
  handleUpdateGoogleConfig ({id, updates}) {
    const mailbox = this.mailboxes.get(id)
    const data = Object.assign({ googleConf: {} }, mailbox.__data__)
    data.googleConf = Object.assign({}, data.googleConf, updates)
    storage.set(MAILBOX_KEY(id), data)
    this.mailboxes.set(id, new Mailbox(id, data))
  }

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
}

module.exports = alt.createStore(MailboxStore, 'MailboxStore')
