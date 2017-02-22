const alt = require('../alt')
const actions = require('./composeActions')
const uuid = require('uuid')
const { ipcRenderer } = window.nativeRequire('electron')

class ComposeStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.composing = false
    this.composeRef = uuid.v4()
    this.recipient = undefined
    this.subject = undefined
    this.body = undefined
    this.targetMailbox = undefined

    /* ****************************************/
    // Message Getters
    /* ****************************************/

    /**
    * @return a dictionary containing just the message info
    */
    this.getMessageInfo = () => {
      return {
        recipient: this.recipient,
        subject: this.subject,
        body: this.body
      }
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/
    this.bindListeners({
      handleComposeNewMessage: actions.COMPOSE_NEW_MESSAGE,
      handleClearCompose: actions.CLEAR_COMPOSE,
      handleSetTargetMailbox: actions.SET_TARGET_MAILBOX
    })
  }

  /* **************************************************************************/
  // New Message
  /* **************************************************************************/

  handleComposeNewMessage ({ recipient, subject, body }) {
    ipcRenderer.send('focus-app', { })
    this.composing = true
    this.composeRef = uuid.v4()
    this.recipient = recipient
    this.subject = subject
    this.body = body
    this.targetMailbox = undefined
  }

  handleClearCompose () {
    this.composing = false
    this.composeRef = uuid.v4()
    this.recipient = undefined
    this.subject = undefined
    this.body = undefined
    this.targetMailbox = undefined
  }

  handleSetTargetMailbox ({ mailboxId }) {
    this.targetMailbox = mailboxId
  }
}

module.exports = alt.createStore(ComposeStore, 'ComposeStore')
