const remote = window.nativeRequire('remote')
const electron = window.nativeRequire('electron')
const Tray = remote.require('tray')
const systemPreferences = remote.systemPreferences
const Menu = remote.Menu
const ipc = electron.ipcRenderer
const NativeImage = remote.nativeImage
const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const mailboxDispatch = require('./Dispatch/mailboxDispatch')
const mailboxActions = require('../stores/mailbox/mailboxActions')

module.exports = React.createClass({
  displayName: 'Tray',

  propTypes: {
    unreadCount: React.PropTypes.number.isRequired,
    unreadMessages: React.PropTypes.object.isRequired,
    showUnreadCount: React.PropTypes.bool.isRequired,
    unreadColor: React.PropTypes.string,
    readColor: React.PropTypes.string
  },

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    const loader = new window.Image()
    loader.src = 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMDAwMDAwIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPiAgICA8cGF0aCBkPSJNMjAgNEg0Yy0xLjEgMC0xLjk5LjktMS45OSAyTDIgMThjMCAxLjEuOSAyIDIgMmgxNmMxLjEgMCAyLS45IDItMlY2YzAtMS4xLS45LTItMi0yem0wIDE0SDRWOGw4IDUgOC01djEwem0tOC03TDQgNmgxNmwtOCA1eiIvPjwvc3ZnPg=='
    loader.onload = (e) => {
      this.setState({ icon: loader })
    }
  },

  componentWillUnmount () {
    if (this.state.appTray) {
      this.state.appTray.destroy()
    }
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getDefaultReadColor () { return process.platform === 'darwin' && systemPreferences.isDarkMode() ? '#FFFFFF' : '#000000' },
  getDefaultUnreadColor () { return '#C82018' },

  getInitialState () {
    const appTray = new Tray(null)
    if (process.platform === 'win32') {
      appTray.on('double-click', () => {
        ipc.send('focus-app')
      })
    }
    return { appTray: appTray }
  },

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * @return the nativeImage for the tray
  */
  renderImage () {
    const SIZE = 22 * window.devicePixelRatio
    const PADDING = SIZE * 0.15
    const CENTER = SIZE / 2
    const COLOR = this.props.unreadCount ? (this.props.unreadColor || this.getDefaultUnreadColor()) : (this.props.readColor || this.getDefaultReadColor())

    const canvas = document.createElement('canvas')
    canvas.width = SIZE
    canvas.height = SIZE

    const ctx = canvas.getContext('2d')

    // Count
    if (this.props.showUnreadCount && this.props.unreadCount && this.props.unreadCount < 99) {
      ctx.fillStyle = COLOR
      ctx.textAlign = 'center'
      if (this.props.unreadCount < 10) {
        ctx.font = (SIZE * 0.5) + 'px Helvetica'
        ctx.fillText(this.props.unreadCount, CENTER, CENTER + (SIZE * 0.20))
      } else {
        ctx.font = (SIZE * 0.4) + 'px Helvetica'
        ctx.fillText(this.props.unreadCount, CENTER, CENTER + (SIZE * 0.15))
      }
    } else {
      const ICON_SIZE = SIZE * 0.5
      const POS = (SIZE - ICON_SIZE) / 2
      ctx.fillStyle = COLOR
      ctx.fillRect(0, 0, SIZE, SIZE)
      ctx.globalCompositeOperation = 'destination-atop'
      ctx.drawImage(this.state.icon, POS, POS, ICON_SIZE, ICON_SIZE)
    }

    // Outer circle
    ctx.globalCompositeOperation = 'source-over'
    ctx.beginPath()
    ctx.arc(CENTER, CENTER, (SIZE / 2) - PADDING, 0, 2 * Math.PI, false)
    ctx.lineWidth = window.devicePixelRatio * 1.1
    ctx.strokeStyle = COLOR
    ctx.stroke()

    const pngData = NativeImage.createFromDataURL(canvas.toDataURL('image/png')).toPng()
    return NativeImage.createFromBuffer(pngData, window.devicePixelRatio)
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
    // Build the unread items up
    const unreadItems = Object.keys(this.props.unreadMessages)
      .reduce((acc, mailboxId) => {
        const messages = Object.keys(this.props.unreadMessages[mailboxId])
          .map((id) => this.props.unreadMessages[mailboxId][id])
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
          click: (e) => {
            mailboxActions.changeActive(info.mailboxId)
            mailboxDispatch.openMessage(info.mailboxId, info.message.threadId, info.message.id)
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
    if (!this.state.appTray || !this.state.icon) { return false }
    this.state.appTray.setImage(this.renderImage())
    this.state.appTray.setToolTip(this.renderTooltip())
    this.state.appTray.setContextMenu(this.renderContextMenu())

    return <div></div>
  }
})
