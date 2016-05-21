import './mailboxWindow.less'
const React = require('react')
const ReactDOM = require('react-dom')
const flux = {
  mailbox: require('../../stores/mailbox'),
  google: require('../../stores/google'),
  settings: require('../../stores/settings')
}
const {shell} = window.nativeRequire('electron').remote
const URL = window.nativeRequire('url')
const ipc = window.nativeRequire('electron').ipcRenderer
const mailboxDispatch = require('../Dispatch/mailboxDispatch')
const TimerMixin = require('react-timer-mixin')

module.exports = React.createClass({
  displayName: 'GoogleMailboxWindow',
  mixins: [TimerMixin],
  propTypes: {
    mailbox_id: React.PropTypes.string.isRequired
  },

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.lastSetZoomFactor = 1.0
    this.isMounted = true

    flux.mailbox.S.listen(this.mailboxesChanged)
    mailboxDispatch.on('reload', this.reload)
    mailboxDispatch.on('devtools', this.openDevTools)
    mailboxDispatch.on('refocus', this.refocus)
    mailboxDispatch.on('openMessage', this.openMessage)
    ReactDOM.findDOMNode(this).appendChild(this.renderWebviewDOMNode())
  },

  componentWillUnmount () {
    this.isMounted = false
    mailboxDispatch.off('reload', this.reload)
    mailboxDispatch.off('devtools', this.openDevTools)
    mailboxDispatch.off('refocus', this.refocus)
    mailboxDispatch.off('openMessage', this.openMessage)
    flux.mailbox.S.unlisten(this.mailboxesChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    const mailboxStore = flux.mailbox.S.getState()
    return {
      mailbox: mailboxStore.get(this.props.mailbox_id),
      isActive: mailboxStore.activeId() === this.props.mailbox_id
    }
  },

  mailboxesChanged (store) {
    if (this.isMounted === false) { return }
    this.setState({
      mailbox: store.get(this.props.mailbox_id),
      isActive: store.activeId() === this.props.mailbox_id
    })
  },

  shouldComponentUpdate (nextProps, nextState) {
    this.updateWebviewDOMNode(nextProps, nextState)
    return false // we never update this element
  },

  /* **************************************************************************/
  // Dispatcher Events
  /* **************************************************************************/

  /**
  * Handles a reload dispatch event
  * @param evt: the event that fired
  */
  reload (evt) {
    if (evt.mailboxId === this.props.mailbox_id) {
      const webview = ReactDOM.findDOMNode(this).getElementsByTagName('webview')[0]
      webview.setAttribute('src', this.state.mailbox.url)
      flux.google.A.syncMailbox(this.state.mailbox)
    }
  },

  /**
  * Handles the inspector dispatch event
  * @param evt: the event that fired
  */
  openDevTools (evt) {
    if (evt.mailboxId === this.props.mailbox_id) {
      const webview = ReactDOM.findDOMNode(this).getElementsByTagName('webview')[0]
      webview.openDevTools()
    }
  },

  /**
  * Handles refocusing the mailbox
  * @param evt: the event that fired
  */
  refocus (evt) {
    if (evt.mailboxId === this.props.mailbox_id || (!evt.mailboxId && this.state.isActive)) {
      const webview = ReactDOM.findDOMNode(this).getElementsByTagName('webview')[0]
      setTimeout(() => { webview.focus() })
    }
  },

  /**
  * Handles opening a new message
  * @param evt: the event that fired
  */
  openMessage (evt) {
    if (evt.mailboxId === this.props.mailbox_id) {
      const webview = ReactDOM.findDOMNode(this).getElementsByTagName('webview')[0]
      webview.send('open-message', { messageId: evt.messageId, threadId: evt.threadId })
    }
  },

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles a new window open request
  * @param evt: the event
  * @param webview: the webview element the event came from
  */
  handleOpenNewWindow (evt, webview) {
    const url = URL.parse(evt.url, true)
    let mode = 'external'
    if (url.host === 'inbox.google.com') {
      mode = 'source'
    } else if (url.host === 'mail.google.com') {
      if (url.query.ui === '2') {
        mode = 'tab'
      } else {
        mode = 'source'
      }
    }

    switch (mode) {
      case 'external':
        shell.openExternal(evt.url, { activate: !flux.settings.S.getState().os.openLinksInBackground })
        break
      case 'source':
        webview.src = evt.url
        break
      case 'tab':
        ipc.send('new-window', { partition: webview.partition, url: evt.url })
        break
    }
  },

  /* **************************************************************************/
  // UI Modifiers
  /* **************************************************************************/

  /**
  * Composes a new message
  * @param email: the email address to send the message to
  */
  composeMessage (email) {
    const webview = ReactDOM.findDOMNode(this).getElementsByTagName('webview')[0]

    switch (this.state.mailbox.type) {
      case flux.mailbox.M.TYPE_GMAIL:
        ipc.send('new-window', {
          partition: webview.partition,
          url: 'https://mail.google.com/mail/?view=cm&fs=1&tf=1&shva=1&to=' + email
        })
        break
      case flux.mailbox.M.TYPE_GINBOX:
        webview.loadURL('https://inbox.google.com/?view=cm&fs=1&tf=1&shva=1&to=' + email)
        break
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * For some reason react strips out the partition keyword, so we have to generate
  * the dom node. Also because it reloads the element when active changes and we need
  * the ref to the node for binding electron events we sink down to normal html
  */
  renderWebviewDOMNode () {
    // Setup the session that will be used
    const partition = 'persist:' + this.state.mailbox.id
    ipc.send('prepare-webview-session', { partition: partition })

    // Build the dom
    const webview = document.createElement('webview')
    webview.setAttribute('preload', '../platform/webviewInjection/google')
    webview.setAttribute('partition', partition)
    webview.setAttribute('src', this.state.mailbox.url)
    webview.setAttribute('data-mailbox', this.state.mailbox.id)
    webview.classList.add('mailbox-window')

    // Active state
    if (this.state.isActive) {
      webview.classList.add('active')
      setTimeout(() => {
        webview.focus()
      })
    }

    // Bind events
    webview.addEventListener('dom-ready', () => {
      // Push the settings across
      webview.send('zoom-factor-set', { value: this.state.mailbox.zoomFactor })
      this.lastSetZoomFactor = this.state.mailbox.zoomFactor
      webview.send('start-spellcheck', {
        enabled: flux.settings.S.getState().language.spellcheckerEnabled
      })
    })

    // Handle messages from the page
    webview.addEventListener('ipc-message', (evt) => {
      if (evt.channel.type === 'page-click') {
        if (!flux.google.S.getState().hasOpenUnreadCountRequest(this.state.mailbox.id)) {
          flux.google.A.syncMailboxUnreadCount(this.state.mailbox.id)
        }
      } else if (evt.channel.type === 'js-new-window') {
        shell.openExternal(evt.channel.url, { activate: !flux.settings.S.getState().os.openLinksInBackground })
      }
    })
    webview.addEventListener('new-window', (evt) => {
      this.handleOpenNewWindow(evt, webview)
    })
    webview.addEventListener('will-navigate', (evt) => {
      // the lamest protection again dragging files into the window
      // but this is the only thing I could find that leaves file drag working
      if (evt.url.indexOf('file://') === 0) {
        webview.setAttribute('src', this.state.mailbox.url)
      }
    })
    webview.addEventListener('focus', (evt) => {
      mailboxDispatch.focused(this.props.mailbox_id)
    })
    webview.addEventListener('blur', (evt) => {
      mailboxDispatch.blurred(this.props.mailbox_id)
    })

    return webview
  },

  /**
  * Update the dom node manually so that react doesn't keep re-loading our
  * webview element when it decides that it wants to re-render
  * @param nextProps: the next props
  * @param nextState: the next state
  */
  updateWebviewDOMNode (nextProps, nextState) {
    if (!nextState.mailbox) { return }

    const webview = ReactDOM.findDOMNode(this).getElementsByTagName('webview')[0]

    // Change the active state
    if (this.state.isActive !== nextState.isActive) {
      if (nextState.isActive) {
        webview.classList.add('active')
        setTimeout(() => {
          webview.focus()
        })
      } else {
        webview.classList.remove('active')
      }
    }

    if (this.state.mailbox !== nextState.mailbox) {
      // Set the zoom factor
      if (nextState.mailbox.zoomFactor !== this.lastSetZoomFactor) {
        webview.send('zoom-factor-set', { value: nextState.mailbox.zoomFactor })
        this.lastSetZoomFactor = nextState.mailbox.zoomFactor
      }
    }
  },

  /**
  * Renders the app
  */
  render () {
    if (!this.state.mailbox) { return false }

    return <div {...this.props}></div>
  }
})
