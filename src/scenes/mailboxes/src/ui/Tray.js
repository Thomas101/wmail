const electron = window.nativeRequire('electron')
const { ipcRenderer, remote } = electron
const { Tray, Menu, nativeImage } = remote
const React = require('react')
const { mailboxDispatch } = require('../Dispatch')
const { mailboxActions, mailboxStore } = require('../stores/mailbox')
const { composeActions } = require('../stores/compose')
const { BLANK_PNG } = require('shared/b64Assets')
const { TrayRenderer } = require('../Components')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/
  displayName: 'Tray',

  // Pretty strict on updating. If you're changing these, change shouldComponentUpdate :)
  propTypes: {
    unreadCount: React.PropTypes.number.isRequired,
    traySettings: React.PropTypes.object.isRequired
  },
  statics: {
    platformSupportsDpiMultiplier: () => {
      return process.platform === 'darwin' || process.platform === 'linux'
    }
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)

    this.appTray = new Tray(nativeImage.createFromDataURL(BLANK_PNG))
    if (process.platform === 'win32') {
      this.appTray.on('double-click', () => {
        ipcRenderer.send('toggle-mailbox-visibility-from-tray')
      })
    } else if (process.platform === 'linux') {
      // On platforms that have app indicator support - i.e. ubuntu clicking on the
      // icon will launch the context menu. On other linux platforms the context
      // menu is opened on right click. For app indicator platforms click event
      // is ignored
      this.appTray.on('click', () => {
        ipcRenderer.send('toggle-mailbox-visibility-from-tray')
      })
    }
  },

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)

    if (this.appTray) {
      this.appTray.destroy()
      this.appTray = null
    }
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return Object.assign({}, this.generateMenuUnreadMessages())
  },

  mailboxesChanged (store) {
    this.setState(this.generateMenuUnreadMessages(store))
  },

  /**
  * Generates the unread messages from the mailboxes store
  * @param store=autogen: the mailbox store
  * @return { menuUnreadMessages, menuUnreadMessagesSig } with menuUnreadMessages
  * being an array of mailboxes with menu items prepped to display and menuUnreadMessagesSig
  * being a string hash of these to compare
  */
  generateMenuUnreadMessages (store = mailboxStore.getState()) {
    const menuItems = store.mailboxIds().map((mailboxId) => {
      const mailbox = store.getMailbox(mailboxId)
      const menuItems = mailbox.google.latestUnreadMessages.map((message) => {
        const headers = message.payload.headers
        const subject = (headers.find((h) => h.name === 'Subject') || {}).value || 'No Subject'
        const fromEmail = (headers.find((h) => h.name === 'From') || {}).value || ''
        const fromEmailMatch = fromEmail.match('(.+)<(.+)@(.+)>$')
        const sender = fromEmailMatch ? fromEmailMatch[1].trim() : fromEmail

        return {
          id: `${mailboxId}:${message.threadId}:${message.id}`, // used for update tracking
          label: `${sender} : ${subject}`,
          date: parseInt(message.internalDate),
          click: (e) => {
            ipcRenderer.send('focus-app', { })
            mailboxActions.changeActive(mailboxId)
            mailboxDispatch.openMessage(mailboxId, message.threadId, message.id)
          }
        }
      })
      .filter((info) => info !== undefined)
      .sort((a, b) => b.date - a.date)
      .slice(0, 10)

      const unreadString = isNaN(mailbox.unread) || mailbox.unread === 0 ? '' : `(${mailbox.unread})`

      return {
        label: `${unreadString} ${mailbox.email || 'Untitled'}`,
        submenu: menuItems.length !== 0 ? menuItems : [
          { label: 'No messages', enabled: false }
        ]
      }
    })

    const sig = menuItems
      .map((mailboxItem) => mailboxItem.submenu.map((item) => item.id).join('|'))
      .join('|')

    return { menuUnreadMessages: menuItems, menuUnreadMessagesSig: sig }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.unreadCount !== nextProps.unreadCount) { return true }
    if (this.state.menuUnreadMessagesSig !== nextState.menuUnreadMessagesSig) { return true }

    const trayDiff = [
      'unreadColor',
      'unreadBackgroundColor',
      'readColor',
      'readBackgroundColor',
      'showUnreadCount',
      'dpiMultiplier'
    ].findIndex((k) => {
      return this.props.traySettings[k] !== nextProps.traySettings[k]
    }) !== -1
    if (trayDiff) { return true }

    return false
  },

  /**
  * @return the tooltip string for the tray icon
  */
  renderTooltip () {
    return this.props.unreadCount ? this.props.unreadCount + ' unread mail' : 'No unread mail'
  },

  /**
  * @return the context menu for the tray icon
  */
  renderContextMenu () {
    let unreadItems = []
    if (this.state.menuUnreadMessages.length === 1) { // Only one account
      unreadItems = this.state.menuUnreadMessages[0].submenu
    } else if (this.state.menuUnreadMessages.length > 1) { // Multiple accounts
      unreadItems = this.state.menuUnreadMessages
    }

    // Build the template
    let template = [
      {
        label: 'Compose New Message',
        click: (e) => {
          ipcRenderer.send('focus-app')
          composeActions.composeNewMessage()
        }
      },
      { label: this.renderTooltip(), enabled: false },
      { type: 'separator' }
    ]

    if (unreadItems.length) {
      template = template.concat(unreadItems)
      template.push({ type: 'separator' })
    }

    template = template.concat([
      {
        label: 'Show / Hide',
        click: (e) => {
          ipcRenderer.send('toggle-mailbox-visibility-from-tray')
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: (e) => {
          ipcRenderer.send('quit-app')
        }
      }
    ])

    return Menu.buildFromTemplate(template)
  },

  /**
  * @return the tray icon size
  */
  trayIconSize () {
    switch (process.platform) {
      case 'darwin': return 22
      case 'win32': return 16
      case 'linux': return 32 * this.props.traySettings.dpiMultiplier
      default: return 32
    }
  },

  /**
  * @return the pixel ratio
  */
  trayIconPixelRatio () {
    switch (process.platform) {
      case 'darwin': return this.props.traySettings.dpiMultiplier
      default: return 1
    }
  },

  render () {
    const { unreadCount, traySettings } = this.props

    // Not great that this happens in a promise, but it's pretty quick so should be okay
    TrayRenderer.renderNativeImage({
      unreadCount: unreadCount,
      showUnreadCount: traySettings.showUnreadCount,
      unreadColor: traySettings.unreadColor,
      readColor: traySettings.readColor,
      unreadBackgroundColor: traySettings.unreadBackgroundColor,
      readBackgroundColor: traySettings.readBackgroundColor,
      size: this.trayIconSize(),
      pixelRatio: this.trayIconPixelRatio()
    }).then((image) => {
      this.appTray.setImage(image)
      this.appTray.setToolTip(this.renderTooltip())
      this.appTray.setContextMenu(this.renderContextMenu())
    })

    return (<div />)
  }
})
