const persistence = require('../storage/mailboxStorage')
const Minivents = require('minivents')
const Mailbox = require('../../shared/Models/Mailbox/Mailbox')
const { MAILBOX_INDEX_KEY } = require('../../shared/constants')

class MailboxStore {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    Minivents(this)

    // Build the current data
    this.index = []
    this.mailboxes = new Map()

    const allRawItems = persistence.allJSONItems()
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
        this.index = persistence.getJSONItem(MAILBOX_INDEX_KEY)
      } else {
        if (evt.type === 'setItem') {
          this.mailboxes.set(evt.key, new Mailbox(evt.key, persistence.getJSONItem(evt.key)))
        }
        if (evt.type === 'removeItem') {
          this.mailboxes.delete(evt.key)
        }
      }
      this.emit('changed', {})
    })
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * @return the mailboxes in an ordered list
  */
  orderedMailboxes () {
    return this.index
      .map(id => this.mailboxes.get(id))
      .filter((mailbox) => !!mailbox)
  }

  /**
  * @param id: the id of the mailbox
  * @return the mailbox record
  */
  getMailbox (id) {
    return this.mailboxes.get(id)
  }
}

module.exports = new MailboxStore()
