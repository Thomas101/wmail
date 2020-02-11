const { Mailbox, Google } = require('shared/Models/Mailbox')
const configurations = {}
configurations[Mailbox.TYPE_GMAIL] = {
  DEFAULT_INBOX: { // Unread Messages in primary category
    googleConf: {
      takeLabelCountFromUI: false,
      unreadMode: Google.UNREAD_MODES.PRIMARY_INBOX_UNREAD//
    }
  },
  PRIORIY_INBOX: { // Unread Important Messages
    googleConf: {
      takeLabelCountFromUI: false,
      unreadMode: Google.UNREAD_MODES.INBOX_UNREAD_IMPORTANT
    }
  },
  UNREAD_INBOX: { // All Unread Messages
    googleConf: {
      takeLabelCountFromUI: false,
      unreadMode: Google.UNREAD_MODES.INBOX_UNREAD
    }
  }
}
configurations[Mailbox.TYPE_GINBOX] = {
  UNREAD_INBOX: {
    googleConf: {
      takeLabelCountFromUI: false,
      unreadMode: Google.UNREAD_MODES.INBOX_UNREAD
    }
  },
  DEFAULT_INBOX: {
    googleConf: {
      takeLabelCountFromUI: false,
      unreadMode: Google.UNREAD_MODES.GINBOX_DEFAULT
    }
  }
}

module.exports = configurations
