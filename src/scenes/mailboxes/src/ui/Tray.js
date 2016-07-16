const electron = window.nativeRequire('electron')
const {Tray, systemPreferences, Menu, nativeImage} = electron.remote
const ipc = electron.ipcRenderer
const React = require('react')
const {mailboxDispatch} = require('../Dispatch')
const mailboxActions = require('../stores/mailbox/mailboxActions')
const {
  BLANK_PNG,
  MAIL_SVG
} = require('shared/b64Assets')

module.exports = React.createClass({
  displayName: 'Tray',

  // Pretty strict on updating. If you're chaning these, change shouldComponentUpdate :)
  propTypes: {
    unreadCount: React.PropTypes.number.isRequired,
    unreadMessages: React.PropTypes.object.isRequired,
    traySettings: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.appTray = new Tray(nativeImage.createFromDataURL(BLANK_PNG))
    if (process.platform === 'win32') {
      this.appTray.on('double-click', () => {
        ipc.send('focus-app')
      })
    }

    const loader = new window.Image()
    loader.src = MAIL_SVG
    loader.onload = (e) => {
      this.setState({ icon: loader })
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

  getDefaultReadColor () { return process.platform === 'darwin' && systemPreferences.isDarkMode() ? '#FFFFFF' : '#000000' },
  getDefaultUnreadColor () { return '#C82018' },

  getInitialState () {
    return Object.assign(
      {
        icon: null
      },
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
    if (!!this.state.icon !== !!nextState.icon) { return true }

    const trayDiff = ['unreadColor', 'readColor', 'showUnreadCount', 'isReadColorDefault'].findIndex((k) => {
      return this.props.traySettings[k] !== nextProps.traySettings[k]
    }) !== -1
    if (trayDiff) { return true }

    return false
  },

  /**
  * @return the nativeImage for the tray
  */
  renderImage () {
    const { traySettings, unreadCount } = this.props
    const { unreadColor, readColor, showUnreadCount, isReadColorDefault } = traySettings
    const SIZE = 22 * window.devicePixelRatio
    const PADDING = SIZE * 0.15
    const CENTER = SIZE / 2
    let color
    if (unreadCount) {
      color = unreadColor || this.getDefaultReadColor()
    } else {
      color = isReadColorDefault ? this.getDefaultReadColor() : readColor
    }

    const canvas = document.createElement('canvas')
    canvas.width = SIZE
    canvas.height = SIZE

    const ctx = canvas.getContext('2d')

    // Count
    if (showUnreadCount && unreadCount && unreadCount < 99) {
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      if (unreadCount < 10) {
        ctx.font = (SIZE * 0.5) + 'px Helvetica'
        ctx.fillText(unreadCount, CENTER, CENTER + (SIZE * 0.20))
      } else {
        ctx.font = (SIZE * 0.4) + 'px Helvetica'
        ctx.fillText(unreadCount, CENTER, CENTER + (SIZE * 0.15))
      }
    } else {
      const ICON_SIZE = SIZE * 0.5
      const POS = (SIZE - ICON_SIZE) / 2
      ctx.fillStyle = color
      ctx.fillRect(0, 0, SIZE, SIZE)
      ctx.globalCompositeOperation = 'destination-atop'
      ctx.drawImage(this.state.icon, POS, POS, ICON_SIZE, ICON_SIZE)
    }

    // Outer circle
    ctx.globalCompositeOperation = 'source-over'
    ctx.beginPath()
    ctx.arc(CENTER, CENTER, (SIZE / 2) - PADDING, 0, 2 * Math.PI, false)
    ctx.lineWidth = window.devicePixelRatio * 1.1
    ctx.strokeStyle = color
    ctx.stroke()

    const pngData = nativeImage.createFromDataURL(canvas.toDataURL('image/png')).toPng()
    return nativeImage.createFromBuffer(pngData, window.devicePixelRatio)
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
          ipc.send('focus-app', { })
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
      { label: 'Focus', click: (e) => ipc.send('focus-app') },
      { type: 'separator' },
      { label: 'Quit', click: (e) => ipc.send('quit-app') }
    ])

    return Menu.buildFromTemplate(template)
  },

  render () {
    if (!this.appTray || !this.state.icon) { return false }
    this.appTray.setImage(this.renderImage())
    this.appTray.setToolTip(this.renderTooltip())
    this.appTray.setContextMenu(this.renderContextMenu())

    return (<div></div>)
  }
})
