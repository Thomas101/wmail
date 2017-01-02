const alt = require('../alt')
const actions = require('./mailboxActions')
const Mailbox = require('shared/Models/Mailbox/Mailbox')
const uuid = require('uuid')
const persistence = {
  mailbox: require('./mailboxPersistence'),
  avatar: require('./avatarPersistence')
}
const { MAILBOX_INDEX_KEY } = require('shared/constants')
const { BLANK_PNG } = require('shared/b64Assets')
const migration = require('./migration')
const { ipcRenderer } = window.nativeRequire('electron')

class MailboxStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.index = []
    this.mailboxes = new Map()
    this.avatars = new Map()
    this.active = null
    this.activeService = Mailbox.SERVICES.DEFAULT
    this.search = new Map()

    /* ****************************************/
    // Fetching Mailboxes
    /* ****************************************/

    /**
    * @return all the mailboxes in order
    */
    this.allMailboxes = () => { return this.index.map((id) => this.mailboxes.get(id)) }

    /**
    * @return the ids
    */
    this.mailboxIds = () => { return Array.from(this.index) }

    /**
    * @return the mailbox
    */
    this.getMailbox = (id) => { return this.mailboxes.get(id) || null }

    /**
    * @return the count of mailboxes
    */
    this.mailboxCount = () => { return this.mailboxes.size }

    /* ****************************************/
    // Avatar
    /* ****************************************/

    this.getAvatar = (id) => { return this.avatars.get(id) || BLANK_PNG }

    /* ****************************************/
    // Active
    /* ****************************************/

    /**
    * @return the id of the active mailbox
    */
    this.activeMailboxId = () => { return this.active }

    /**
    * @return the service type of the active mailbox
    */
    this.activeMailboxService = () => {
      if (this.activeService === Mailbox.SERVICES.DEFAULT) {
        return Mailbox.SERVICES.DEFAULT
      } else {
        const mailbox = this.activeMailbox()
        const valid = mailbox.enabledServies.findIndex((s) => s === this.activeService) !== -1
        return valid ? this.activeService : Mailbox.SERVICES.DEFAULT
      }
    }

    /**
    * @return the active mailbox
    */
    this.activeMailbox = () => { return this.mailboxes.get(this.active) }

    /**
    * @param mailboxId: the id of the mailbox
    * @param service: the type of service
    * @return true if this mailbox is active, false otherwise
    */
    this.isActive = (mailboxId, service) => {
      return this.activeMailboxId() === mailboxId && this.activeMailboxService() === service
    }

    /* ****************************************/
    // Search
    /* ****************************************/

    /**
    * @param mailboxId: the id of the mailbox
    * @param service: the service of the mailbox
    * @return true if the mailbox is searching, false otherwise
    */
    this.isSearchingMailbox = (mailboxId, service) => {
      return this.search.get(`${mailboxId}:${service}`) === true
    }

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
      return this.allMailboxes().reduce((acc, mailbox) => {
        if (mailbox && !isNaN(mailbox.unread) && mailbox.unreadCountsTowardsAppUnread) {
          acc += mailbox.unread
        }
        return acc
      }, 0)
    }

    /**
    * @return all the unread messages for the app badge
    */
    this.unreadMessagesForAppBadge = () => {
      return this.allMailboxes().reduce((acc, mailbox) => {
        if (mailbox && mailbox.unreadCountsTowardsAppUnread) {
          if (mailbox.google) {
            acc[mailbox.id] = Object.assign({}, mailbox.google.unreadMessages)
          }
        }
        return acc
      }, {})
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      // Load
      handleLoad: actions.LOAD,

      // Create & Remove
      handleCreate: actions.CREATE,
      handleRemove: actions.REMOVE,

      // Update
      handleUpdate: actions.UPDATE,
      handleSetCustomAvatar: actions.SET_CUSTOM_AVATAR,

      // Active Update
      handleIncreaseActiveZoom: actions.INCREASE_ACTIVE_ZOOM,
      handleDecreaseActiveZoom: actions.DECREASE_ACTIVE_ZOOM,
      handleResetActiveZoom: actions.RESET_ACTIVE_ZOOM,

      // Search
      handleStartSearchingMailbox: actions.START_SEARCHING_MAILBOX,
      handleStopSearchingMailbox: actions.STOP_SEARCHING_MAILBOX,

      // Google
      handleUpdateGoogleConfig: actions.UPDATE_GOOGLE_CONFIG,
      handleSetGoogleLatestUnreadThreads: actions.SET_GOOGLE_LATEST_UNREAD_THREADS,

      // Active & Ordering
      handleChangeActive: actions.CHANGE_ACTIVE,
      handleChangeActivePrev: actions.CHANGE_ACTIVE_TO_PREV,
      handleChangeActiveNext: actions.CHANGE_ACTIVE_TO_NEXT,
      handleMoveUp: actions.MOVE_UP,
      handleMoveDown: actions.MOVE_DOWN
    })
  }

  /* **************************************************************************/
  // Handlers Load
  /* **************************************************************************/

  /**
  * Loads the storage from disk
  */
  handleLoad () {
    // Migration
    migration.from_1_3_1()

    // Load
    const allAvatars = persistence.avatar.allItemsSync()
    const allMailboxes = persistence.mailbox.allJSONItemsSync()
    this.index = []

    // Mailboxes
    Object.keys(allMailboxes).forEach((id) => {
      if (id === MAILBOX_INDEX_KEY) {
        this.index = allMailboxes[MAILBOX_INDEX_KEY]
      } else {
        this.mailboxes.set(id, new Mailbox(id, allMailboxes[id]))
        ipcRenderer.send('prepare-webview-session', { partition: 'persist:' + id })
      }
    })
    this.active = this.index[0] || null

    // Avatars
    Object.keys(allAvatars).forEach((id) => {
      this.avatars.set(id, allAvatars[id])
    })
  }

  /* **************************************************************************/
  // Handlers Create & Remove
  /* **************************************************************************/

  /**
  * Creates a new mailbox
  * @param id: the id of the mailbox
  * @param data: the data to seed the mailbox with
  */
  handleCreate ({id, data}) {
    persistence.mailbox.setJSONItem(id, data)
    this.mailboxes.set(id, new Mailbox(id, data))
    ipcRenderer.send('prepare-webview-session', { partition: 'persist:' + id })
    this.index.push(id)
    persistence.mailbox.setJSONItem(MAILBOX_INDEX_KEY, this.index)
    this.active = id
  }

  /**
  * Removes an item
  * @param id: the id to remove
  */
  handleRemove ({id}) {
    const wasActive = this.active === id
    this.index = this.index.filter((i) => i !== id)
    persistence.mailbox.setJSONItem(MAILBOX_INDEX_KEY, this.index)
    this.mailboxes.delete(id)
    persistence.mailbox.removeItem(id)

    if (wasActive) {
      this.active = this.index[0]
    }
  }

  /* **************************************************************************/
  // Handlers Update
  /* **************************************************************************/

  /**
  * Updates a mailboxJS object by taking the path and value
  * @param mailboxJS: the mailbox js object to update in situ
  * @param path: the path to update
  * @param value: the value to update with
  * @return the updated mailboxJS although this item has been updated in situ
  */
  _updateMailboxJSWithPath_ (mailboxJS, path, value) {
    let pointer = mailboxJS
    path.split('.').forEach((fragment, index, fragments) => {
      if (index === fragments.length - 1) {
        pointer[fragment] = value
      } else {
        if (!pointer[fragment]) {
          pointer[fragment] = {}
        }
        pointer = pointer[fragment]
      }
    })
    return mailboxJS
  }

  /**
  * Handles a mailbox updating
  * @param id: the id of the tem
  * @param updates: the updates to merge in
  */
  handleUpdate ({id, updates, path, value}) {
    const mailboxJS = this.mailboxes.get(id).cloneData()
    if (updates !== undefined) {
      Object.keys(updates).forEach((path) => {
        this._updateMailboxJSWithPath_(mailboxJS, path, updates[path])
      })
    } else {
      this._updateMailboxJSWithPath_(mailboxJS, path, value)
    }
    persistence.mailbox.setJSONItem(id, mailboxJS)
    this.mailboxes.set(id, new Mailbox(id, mailboxJS))
  }

  /**
  * Handles setting a custom avatar
  * @param: id the id of the mailbox
  * @param b64Image: a base64 version of the image
  */
  handleSetCustomAvatar ({id, b64Image}) {
    const mailbox = this.mailboxes.get(id)
    let data = mailbox.cloneData()
    if (b64Image) {
      const imageId = uuid.v4()
      data.customAvatar = imageId
      persistence.avatar.setItem(imageId, b64Image)
      this.avatars.set(imageId, b64Image)
    } else {
      if (data.customAvatar) {
        persistence.avatar.removeItem(data.customAvatar)
        this.avatars.delete(data.customAvatar)
        delete data.customAvatar
      }
    }
    persistence.mailbox.setJSONItem(id, data)
    this.mailboxes.set(id, new Mailbox(id, data))
  }

  /* **************************************************************************/
  // Handlers Update Active
  /* **************************************************************************/

  handleIncreaseActiveZoom () {
    const mailbox = this.activeMailbox()
    if (mailbox) {
      const mailboxJS = mailbox.changeData({
        zoomFactor: Math.min(1.5, mailbox.zoomFactor + 0.1)
      })
      persistence.mailbox.setJSONItem(mailbox.id, mailboxJS)
      this.mailboxes.set(mailbox.id, new Mailbox(mailbox.id, mailboxJS))
    }
  }

  handleDecreaseActiveZoom () {
    const mailbox = this.activeMailbox()
    if (mailbox) {
      const mailboxJS = mailbox.changeData({
        zoomFactor: Math.min(1.5, mailbox.zoomFactor - 0.1)
      })
      persistence.mailbox.setJSONItem(mailbox.id, mailboxJS)
      this.mailboxes.set(mailbox.id, new Mailbox(mailbox.id, mailboxJS))
    }
  }

  handleResetActiveZoom () {
    const mailbox = this.activeMailbox()
    if (mailbox) {
      const mailboxJS = mailbox.changeData({ zoomFactor: 1.0 })
      persistence.mailbox.setJSONItem(mailbox.id, mailboxJS)
      this.mailboxes.set(mailbox.id, new Mailbox(mailbox.id, mailboxJS))
    }
  }

  /* **************************************************************************/
  // Handlers : Google
  /* **************************************************************************/

  /**
  * Handles the google config updating
  * @param id: the id of the mailbox
  * @param updates: the updates to merge in
  */
  handleUpdateGoogleConfig ({id, updates}) {
    const data = this.mailboxes.get(id).cloneData()
    data.googleConf = Object.assign(data.googleConf || {}, updates)
    persistence.mailbox.setJSONItem(id, data)
    this.mailboxes.set(id, new Mailbox(id, data))
  }

  /**
  * Updates the google unread threads
  * @param id: the id of the mailbox
  * @param threadList: the complete thread list as an array
  * @param fetchedThreads: the threads that were fetched in an object by id
  */
  handleSetGoogleLatestUnreadThreads ({ id, threadList, fetchedThreads }) {
    const prevThreads = this.mailboxes.get(id).google.latestUnreadThreads.reduce((acc, thread) => {
      acc[thread.id] = thread
      return acc
    }, {})

    // Merge changes
    const nextThreads = threadList.map((threadHead) => {
      if (fetchedThreads[threadHead.id]) {
        return fetchedThreads[threadHead.id]
      } else if (prevThreads[threadHead.id]) {
        return prevThreads[threadHead.id]
      } else {
        return undefined
      }
    }).filter((thread) => !!thread)

    // Write it
    const data = this.mailboxes.get(id).cloneData()
    data.googleUnreadMessageInfo_v2 = data.googleUnreadMessageInfo_v2 || {}
    data.googleUnreadMessageInfo_v2.latestUnreadThreads = nextThreads
    persistence.mailbox.setJSONItem(id, data)
    this.mailboxes.set(id, new Mailbox(id, data))
  }

  /* **************************************************************************/
  // Handlers : Active & Ordering
  /* **************************************************************************/

  /**
  * Handles the active mailbox changing
  * @param id: the id of the mailbox
  * @param service: the service type
  */
  handleChangeActive ({id, service}) {
    this.active = id
    this.activeService = service
  }

  /**
  * Handles the active mailbox changing to the prev in the index
  */
  handleChangeActivePrev () {
    const activeIndex = this.index.findIndex((id) => id === this.active)
    this.active = this.index[Math.max(0, activeIndex - 1)] || null
    this.activeService = Mailbox.SERVICES.DEFAULT
  }

  /**
  * Handles the active mailbox changing to the next in the index
  */
  handleChangeActiveNext () {
    const activeIndex = this.index.findIndex((id) => id === this.active)
    this.active = this.index[Math.min(this.index.length - 1, activeIndex + 1)] || null
    this.activeService = Mailbox.SERVICES.DEFAULT
  }

  /**
  * Handles moving the given mailbox id up
  */
  handleMoveUp ({id}) {
    const mailboxIndex = this.index.findIndex((i) => i === id)
    if (mailboxIndex !== -1 && mailboxIndex !== 0) {
      this.index.splice(mailboxIndex - 1, 0, this.index.splice(mailboxIndex, 1)[0])
      persistence.mailbox.setJSONItem(MAILBOX_INDEX_KEY, this.index)
    }
  }

  /**
  * Handles moving the given mailbox id down
  */
  handleMoveDown ({id}) {
    const mailboxIndex = this.index.findIndex((i) => i === id)
    if (mailboxIndex !== -1 && mailboxIndex < this.index.length) {
      this.index.splice(mailboxIndex + 1, 0, this.index.splice(mailboxIndex, 1)[0])
      persistence.mailbox.setJSONItem(MAILBOX_INDEX_KEY, this.index)
    }
  }

  /* **************************************************************************/
  // Handlers : Search
  /* **************************************************************************/

  /**
  * Indicates the mailbox is searching
  */
  handleStartSearchingMailbox ({ id, service }) {
    if (id && service) {
      this.search.set(`${id}:${service}`, true)
    } else {
      this.search.set(`${this.active}:${this.activeService}`, true)
    }
  }

  /**
  * Indicates the mailbox is no longer searching
  */
  handleStopSearchingMailbox ({id, service}) {
    if (id && service) {
      this.search.delete(`${id}:${service}`)
    } else {
      this.search.delete(`${this.active}:${this.activeService}`)
    }
  }

}

module.exports = alt.createStore(MailboxStore, 'MailboxStore')
