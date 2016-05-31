const persistence = require('../storage/mailboxStorage')
const Minivents = require('minivents')
const Mailbox = require('../../shared/Models/Mailbox/Mailbox')
const { MAILBOX_INDEX_KEY } = require('../../shared/constants')

class MailboxStore {
  constructor () {
    Minivents(this)

    // Build the current data
    this.index = []
    this.mailboxes = new Map()

    const allRawItems = persistence.allItems()
    Object.keys(allRawItems).forEach((id) => {
      if (id === MAILBOX_INDEX_KEY) {
        this.index = allRawItems[id]
      } else {
        this.mailboxes.set(id, new Mailbox(id, allRawItems[id]))
      }
    })

    // Listen for changes
    persistence.on('changed', (evt) => {
      if (evt.key === MAILBOX_INDEX_KEY) {
        this.index = persistence.getItem(MAILBOX_INDEX_KEY)
      } else {
        if (evt.type === 'setItem') {
          this.mailboxes.set(evt.key, new Mailbox(evt.key, persistence.getItem(evt.key)))
        }
        if (evt.type === 'removeItem') {
          this.mailboxes.delete(evt.key)
        }
      }
      this.emit('changed', {})
    })
  }

  orderedMailboxes () {
    return this.index
      .map(id => this.mailboxes.get(id))
      .filter((mailbox) => !!mailbox)
  }
}

module.exports = new MailboxStore()
