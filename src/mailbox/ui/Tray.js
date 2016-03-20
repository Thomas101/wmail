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

const TEMPLATE_SIZE = 22 * window.devicePixelRatio
const CURRENT_PATH = path.dirname(window.location.href.replace('file://', ''))
const IMAGE_MULTIPLIER = window.devicePixelRatio === 1 ? '' : '@' + window.devicePixelRatio + 'x'
const TEMPLATE_PATH = path.join(CURRENT_PATH, 'icons', `tray_22${IMAGE_MULTIPLIER}Template.png`)

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
    // Load the resources
    const template = new Image()
    template.src = TEMPLATE_PATH
    template.onload = () => {
      this.resourcesDidLoad(template)
    }
  },

  /**
  * Handles the resources loading
  * @param template: the template to use
  */
  resourcesDidLoad: function(template) {
    // Build the tray
    const tray = new Tray(null)
    this.setState({
      appTray: tray,
      template: template
    })
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
    return { template: null, appTray: null }
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
    const canvas = document.createElement('canvas')
    canvas.width = TEMPLATE_SIZE
    canvas.height = TEMPLATE_SIZE

    const ctx = canvas.getContext('2d')
    ctx.fillStyle = this.props.unreadCount ? this.props.unreadColor : this.props.readColor
    ctx.fillRect(0, 0, TEMPLATE_SIZE, TEMPLATE_SIZE)
    ctx.globalCompositeOperation = 'destination-atop'
    ctx.drawImage(this.state.template, 0, 0, TEMPLATE_SIZE, TEMPLATE_SIZE)



    /*var context = canvas.getContext('2d');
      var centerX = canvas.width / 2;
      var centerY = canvas.height / 2;
      var radius = w/2;

      context.beginPath();
      context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      context.fillStyle = 'green';
      context.fill();
      context.lineWidth = 5;
      context.strokeStyle = '#003300';
      context.stroke();*/

    if (this.props.showUnreadCount && this.props.unreadCount) {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#0000FF'
      ctx.font = TEMPLATE_SIZE + 'px Arial'
      ctx.textAlign = 'center'
      ctx.fillText("1",TEMPLATE_SIZE/2, TEMPLATE_SIZE)
      //ctx.fillRect(TEMPLATE_SIZE / 2, TEMPLATE_SIZE / 2, TEMPLATE_SIZE / 2, TEMPLATE_SIZE / 2)
    }
    
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
    if (!this.state.template || !this.state.appTray) { return false }

    this.state.appTray.setImage(this.renderImage())
    this.state.appTray.setToolTip(this.renderTooltip())
    this.state.appTray.setContextMenu(this.renderContextMenu())

    return <div></div>
  }
})
