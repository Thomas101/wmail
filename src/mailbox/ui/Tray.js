const remote = window.nativeRequire('remote')
const electron = window.nativeRequire('electron')
const Tray = remote.require('tray')
const app = remote.require('app')
const Menu = remote.Menu
const ipc = electron.ipcRenderer
const NativeImage = remote.nativeImage
const React = require('react')
const path = require('path')
const shallowCompare = require('react-addons-shallow-compare')

module.exports = React.createClass({
  displayName: 'Tray',

  propTypes: {
    unreadCount: React.PropTypes.number.isRequired,
    showUnreadCount: React.PropTypes.bool.isRequired,
    unreadColor: React.PropTypes.string.isRequired,
    readColor: React.PropTypes.string.isRequired
  },

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount: function () {
    const loader = new Image()
    loader.src = 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMDAwMDAwIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPiAgICA8cGF0aCBkPSJNMjAgNEg0Yy0xLjEgMC0xLjk5LjktMS45OSAyTDIgMThjMCAxLjEuOSAyIDIgMmgxNmMxLjEgMCAyLS45IDItMlY2YzAtMS4xLS45LTItMi0yem0wIDE0SDRWOGw4IDUgOC01djEwem0tOC03TDQgNmgxNmwtOCA1eiIvPjwvc3ZnPg=='
    loader.onload = (e) => {
      this.setState({ icon:loader })
    }
  },

  componentWillUnmount: function () {
    if (this.state.appTray) {
      this.state.appTray.destroy()
    }
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getDefaultProps: function() {
    return {
      unreadColor: '#C82018',
      readColor: app.isDarkMode() ? '#FFFFFF' : '#000000'
    }
  },

  getInitialState: function() {
    return { appTray: new Tray(null) }
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * @return the nativeImage for the tray
  */
  renderImage: function () {
    const SIZE = 22 * window.devicePixelRatio
    const PADDING = SIZE * 0.15
    const CENTER = SIZE / 2
    const COLOR = this.props.unreadCount ? this.props.unreadColor : this.props.readColor

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
    
    const pngData = NativeImage.createFromDataURL(canvas.toDataURL("image/png")).toPng()
    return NativeImage.createFromBuffer(pngData, window.devicePixelRatio)
  },

  /**
  * @return the tooltip string for the tray icon
  */
  renderTooltip: function() {
    return this.props.unreadCount ? this.props.unreadCount + ' unread mail' : 'No unread mail'
  },

  /**
  * @return the context menu for the tray icon
  */
  renderContextMenu: function() {
    const contextMenu = Menu.buildFromTemplate([
      { label: this.renderTooltip(), enabled: false },
      { type: 'separator' },
      { label: 'Focus Windows', click:(e) => ipc.send('focus-app') },
      { type: 'separator' },
      { label: 'Quit' }
    ])
    return contextMenu
  },

  render: function () {
    if (!this.state.appTray || !this.state.icon) { return false }
    this.state.appTray.setImage(this.renderImage())
    this.state.appTray.setToolTip(this.renderTooltip())
    this.state.appTray.setContextMenu(this.renderContextMenu())

    return <div></div>
  }
})
