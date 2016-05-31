const persistence = window.remoteRequire('storage/mailboxStorage')
const {MAILBOX_INDEX_KEY} = require('shared/constants')

module.exports = {
  /**
  * Migrates the data from version 1.3.1
  */
  from_1_3_1: function () {
    if (window.localStorage.getItem('migrate_mailboxes_from_1_3_1') !== 'true') {
      const index = JSON.parse(window.localStorage.getItem('Mailbox_index') || '[]')
      if (index.length) {
        const mailboxes = index.reduce((acc, mailboxId) => {
          acc[mailboxId] = JSON.parse(window.localStorage.getItem('Mailbox_' + mailboxId))
          delete acc[mailboxId].customAvatar // not migrating avatars. Drop these
          return acc
        }, {})

        // Write the new values
        Object.keys(mailboxes).forEach((mailboxId) => {
          persistence.setItem(mailboxId, mailboxes[mailboxId])
        })
        persistence.setItem(MAILBOX_INDEX_KEY, index)

        // Write the completion
        window.localStorage.setItem('pre_1_3_1:MailboxIndex', JSON.stringify(index))
        window.localStorage.removeItem('MailboxIndex')
        Object.keys(mailboxes).forEach((mailboxId) => {
          window.localStorage.setItem('pre_1_3_1:Mailbox_' + mailboxId, JSON.stringify(mailboxes[mailboxId]))
          window.localStorage.removeItem('Mailbox_' + mailboxId)
        })
      }
    }

    window.localStorage.setItem('migrate_mailboxes_from_1_3_1', 'true')
  }
}
