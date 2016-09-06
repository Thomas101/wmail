const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const { remote } = window.nativeRequire('electron')
const {nativeImage, app} = remote

const AppBadge = React.createClass({
  displayName: 'AppBadge',

  propTypes: {
    unreadCount: React.PropTypes.number.isRequired
  },
  statics: {
    /**
    * @return true if the current platform supports app badges
    */
    supportsAppBadge () {
      if (process.platform === 'darwin') {
        return true
      } else if (process.platform === 'linux' && app.isUnityRunning()) {
        return true
      } else {
        return false
      }
    },
    /**
    * @return true if this platform supports overlay icons
    */
    supportsAppOverlayIcon () {
      return process.platform === 'win32'
    }
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentWillUnmount () {
    if (AppBadge.supportsAppBadge()) {
      app.setBadgeCount(0)
    } else if (AppBadge.supportsAppOverlayIcon()) {
      const win = remote.getCurrentWindow()
      win.setOverlayIcon(null, '')
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const { unreadCount } = this.props

    if (AppBadge.supportsAppBadge()) {
      app.setBadgeCount(unreadCount)
    } else if (AppBadge.supportsAppOverlayIcon()) {
      const win = remote.getCurrentWindow()
      if (unreadCount === 0) {
        win.setOverlayIcon(null, '')
      } else {
        const text = unreadCount.toString().length > 3 ? '+' : unreadCount.toString()
        const canvas = document.createElement('canvas')
        canvas.height = 140
        canvas.width = 140

        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'red'
        ctx.beginPath()
        ctx.ellipse(70, 70, 65, 65, 0, 0, 2 * Math.PI)
        ctx.fill()
        ctx.textAlign = 'center'
        ctx.fillStyle = 'white'

        if (text.length > 2) {
          ctx.font = '65px sans-serif'
          ctx.fillText(text, 70, 90)
        } else if (text.length > 1) {
          ctx.font = 'bold 80px sans-serif'
          ctx.fillText(text, 70, 97)
        } else {
          ctx.font = 'bold 100px sans-serif'
          ctx.fillText(text, 70, 106)
        }

        const badgeDataURL = canvas.toDataURL()
        const img = nativeImage.createFromDataURL(badgeDataURL)
        win.setOverlayIcon(img, text)
      }
    }

    return (<div />)
  }
})

module.exports = AppBadge
