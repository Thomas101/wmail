const React = require('react')
const MailboxTab = require('../MailboxTab')
const Mailbox = require('shared/Models/Mailbox/Mailbox')
const { composeStore, composeActions } = require('../../../stores/compose')
const { mailboxStore } = require('../../../stores/mailbox')
const { settingsStore } = require('../../../stores/settings')
const { googleActions } = require('../../../stores/google')
const { mailboxDispatch } = require('../../../Dispatch')
const URL = window.nativeRequire('url')
const {
  remote: {shell}, ipcRenderer
} = window.nativeRequire('electron')

const REF = 'mailbox_tab'

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'GoogleMailboxMailTab',
  propTypes: {
    mailboxId: React.PropTypes.string.isRequired
  },

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    // Stores
    composeStore.listen(this.composeChanged)
    mailboxStore.listen(this.mailboxChanged)
    settingsStore.listen(this.settingsChanged)

    // Handle dispatch events
    mailboxDispatch.on('openMessage', this.handleOpenMessage)
    mailboxDispatch.respond('get-google-unread-count:' + this.props.mailboxId, this.handleGetGoogleUnreadCount)

    // Fire an artifical compose change in case the compose event is waiting
    this.composeChanged(composeStore.getState())
  },

  componentWillUnmount () {
    // Stores
    composeStore.unlisten(this.composeChanged)
    mailboxStore.unlisten(this.mailboxChanged)
    settingsStore.unlisten(this.settingsChanged)

    // Handle dispatch events
    mailboxDispatch.off('openMessage', this.handleOpenMessage)
    mailboxDispatch.unrespond('get-google-unread-count:' + this.props.mailboxId, this.handleGetGoogleUnreadCount)
  },

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId) {
      mailboxDispatch.unrespond('get-google-unread-count:' + this.props.mailboxId, this.handleGetGoogleUnreadCount)
      mailboxDispatch.respond('get-google-unread-count:' + nextProps.mailboxId, this.handleGetGoogleUnreadCount)
    }
  },

  /* **************************************************************************/
  // Data lifecylce
  /* **************************************************************************/

  getInitialState () {
    const settingsState = settingsStore.getState()
    return {
      mailboxCount: mailboxStore.getState().mailboxCount(),
      ui: settingsState.ui,
      os: settingsState.os
    }
  },

  mailboxChanged (mailboxState) {
    this.setState({
      mailboxCount: mailboxState.mailboxCount()
    })
  },

  composeChanged (composeState) {
    // Look to see if we should dispatch a compose event down to the UI
    // We clear this directly here rather resetting state
    if (composeState.composing) {
      if (this.state.mailboxCount === 1 || composeState.targetMailbox === this.props.mailboxId) {
        this.refs[REF].send('compose-message', composeState.getMessageInfo())
        composeActions.clearCompose.defer()
      }
    }
  },

  settingsChanged (settingsState) {
    this.setState((prevState) => {
      const update = { os: settingsState.os }
      if (settingsState.ui !== prevState.ui) {
        this.refs[REF].send('window-icons-in-screen', {
          inscreen: !settingsState.ui.sidebarEnabled && !settingsState.ui.showTitlebar && process.platform === 'darwin'
        })
        update.ui = settingsState.ui
      }
      return update
    })
  },

  /* **************************************************************************/
  // Dispatcher Events
  /* **************************************************************************/

  /**
  * Handles opening a new message
  * @param evt: the event that fired
  */
  handleOpenMessage (evt) {
    if (evt.mailboxId === this.props.mailboxId) {
      this.refs[REF].send('open-message', { messageId: evt.messageId, threadId: evt.threadId })
    }
  },

  /**
  * Fetches the gmail unread count
  * @return promise
  */
  handleGetGoogleUnreadCount () {
    return this.refs[REF].sendWithResponse('get-google-unread-count', {}, 1000)
  },

  /* **************************************************************************/
  // Browser Events
  /* **************************************************************************/

  /**
  * Dispatches browser IPC messages to the correct call
  * @param evt: the event that fired
  */
  dispatchBrowserIPCMessage (evt) {
    switch (evt.channel.type) {
      case 'unread-count-changed': googleActions.suggestSyncMailboxUnreadCount(this.props.mailboxId); break
      case 'js-new-window': this.handleBrowserJSNewWindow(evt); break
      default: break
    }
  },

  /**
  * Handles the Browser DOM becoming ready
  */
  handleBrowserDomReady () {
    // UI Fixes
    const ui = this.state.ui
    this.refs[REF].send('window-icons-in-screen', {
      inscreen: !ui.sidebarEnabled && !ui.showTitlebar && process.platform === 'darwin'
    })
  },

  /**
  * Opens a new url in the correct way
  * @param url: the url to open
  */
  handleOpenNewWindow (url) {
    const purl = URL.parse(url, true)
    let mode = 'external'
    if (purl.host === 'inbox.google.com') {
      mode = 'source'
    } else if (purl.host === 'mail.google.com') {
      if (purl.query.ui === '2' || purl.query.view === 'om') {
        mode = 'tab'
      } else {
        mode = 'source'
      }
    }

    switch (mode) {
      case 'external':
        shell.openExternal(url, { activate: !this.state.os.openLinksInBackground })
        break
      case 'source':
        this.setState({ browserSrc: url })
        break
      case 'tab':
        ipcRenderer.send('new-window', { partition: 'persist:' + this.props.mailboxId, url: url })
        break
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    return (
      <MailboxTab
        ref={REF}
        mailboxId={this.props.mailboxId}
        service={Mailbox.SERVICES.DEFAULT}
        newWindow={(evt) => { this.handleOpenNewWindow(evt.url) }}
        domReady={this.handleBrowserDomReady}
        ipcMessage={this.dispatchBrowserIPCMessage} />
    )
  }
})
