const electron = window.nativeRequire('electron')
const { ipcRenderer, remote } = electron
const {Tray, Menu, nativeImage} = remote
const React = require('react')
const {mailboxDispatch} = require('../Dispatch')
const mailboxActions = require('../stores/mailbox/mailboxActions')
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
    unreadMessages: React.PropTypes.object.isRequired,
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
    this.appTray = new Tray(nativeImage.createFromDataURL(BLANK_PNG))
    if (process.platform === 'win32') {
      this.appTray.on('double-click', () => {
        ipcRenderer.send('focus-app')
      })
    }
  },

  componentWillUnmount () {
    if (this.appTray) {
      this.appTray.destroy()
      this.appTray = null
    }
  },

  componentWillReceiveProps (nextProps) {
    this.setState(this.generateCtxMenuUnreadMessages(nextProps.unreadMessages))
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return Object.assign({},
      this.generateCtxMenuUnreadMessages(this.props.unreadMessages)
    )
  },

  /**
  * Generates the unread message data for the context menu in a way that it
  * can be rendered and diffed
  * @param unreadMessages: the raw unread messages to generate from
  * @return { ctxMenuUnreadMessages, ctxMenuUnreadMessagesSig } with ctxMenuUnreadMessages containing
  * the up to date message headers and ctxMenuUnreadMessagesSig containing a string hash of them
  */
  generateCtxMenuUnreadMessages (unreadMessages) {
    const messageInfos = Object.keys(unreadMessages)
      .reduce((acc, mailboxId) => {
        const messages = Object.keys(unreadMessages[mailboxId])
          .map((id) => unreadMessages[mailboxId][id])
          .map((info) => {
            info.mailboxId = mailboxId
            return info
          })
        return acc.concat(messages)
      }, [])
      .filter((info) => info.message !== undefined)
      .sort((a, b) => {
        return parseInt(b.message.internalDate) - parseInt(a.message.internalDate)
      })
      .slice(0, 5)
      .map((info) => {
        const headers = info.message.payload.headers
        const subject = (headers.find((h) => h.name === 'Subject') || {}).value || 'No Subject'
        const fromEmail = (headers.find((h) => h.name === 'From') || {}).value || ''
        const fromEmailMatch = fromEmail.match('(.+)<(.+)@(.+)>$')
        if (fromEmailMatch) {
          info.snippet = fromEmailMatch[1].trim() + ' : ' + subject
        } else {
          info.snippet = fromEmail + ' : ' + subject
        }
        return info
      })
      .map((info) => {
        return {
          label: info.snippet,
          mailboxId: info.mailboxId,
          threadId: info.message.threadId,
          messageId: info.message.id,
          id: `${info.mailboxId}:${info.message.threadId}:${info.message.id}` // used for update tracking
        }
      })

    return {
      ctxMenuUnreadMessages: messageInfos,
      ctxMenuUnreadMessagesSig: messageInfos.map((info) => info.id).join('|')
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.unreadCount !== nextProps.unreadCount) { return true }
    if (this.state.ctxMenuUnreadMessagesSig !== nextState.ctxMenuUnreadMessagesSig) { return true }

    const trayDiff = [
      'unreadColor',
      'unreadBackgroundColor',
      'readColor',
      'readBackgroundColor',
      'showUnreadCount',
      'isReadColorDefault',
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
    const unreadItems = this.state.ctxMenuUnreadMessages.map((info) => {
      return {
        label: info.label,
        click: (e) => {
          ipcRenderer.send('focus-app', { })
          mailboxActions.changeActive(info.mailboxId)
          mailboxDispatch.openMessage(info.mailboxId, info.threadId, info.messageId)
        }
      }
    })

    // Build the template
    let template = [
      { label: this.renderTooltip(), enabled: false },
      { type: 'separator' }
    ]
    if (unreadItems.length) {
      template = template.concat(unreadItems)
      template.push({ type: 'separator' })
    }
    template = template.concat([
      { label: 'Focus', click: (e) => ipcRenderer.send('focus-app') },
      { type: 'separator' },
      { label: 'Quit', click: (e) => ipcRenderer.send('quit-app') }
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
      readColor: TrayRenderer.themedReadColor(traySettings.readColor, traySettings.isReadColorDefault),
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
