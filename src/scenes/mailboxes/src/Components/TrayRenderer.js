const {nativeImage, systemPreferences} = window.nativeRequire('electron').remote
const B64_SVG_PREFIX = 'data:image/svg+xml;base64,'
const MAIL_SVG = window.atob(require('shared/b64Assets').MAIL_SVG.replace(B64_SVG_PREFIX, ''))

class TrayRenderer {

  /**
  * The themed read color
  * @param col: the colour from the store
  * @param isDefault: true if this is the default color
  * @return a themed colour if the default is provided
  */
  static themedReadColor (col, isDefault) {
    if (isDefault) {
      return process.platform === 'darwin' && systemPreferences.isDarkMode() ? '#FFFFFF' : '#000000'
    } else {
      return col
    }
  }

  /**
  * @param config: the config to merge into the default config
  * @return the config for rendering the tray icon
  */
  static defaultConfig (config) {
    if (config.__defaultMerged__) {
      return config
    } else {
      return Object.assign({
        pixelRatio: window.devicePixelRatio,
        unreadCount: 0,
        showUnreadCount: true,
        unreadColor: '#000000',
        readColor: '#C82018',
        unreadBackgroundColor: 'transparent',
        readBackgroundColor: 'transparent',
        size: 100,
        thick: process.platform === 'win32',
        __defaultMerged__: true
      }, config)
    }
  }

  /**
  * Renders the tray icon as a canvas
  * @param config: the config for rendering
  * @return promise with the canvas
  */
  static renderCanvas (config) {
    return new Promise((resolve, reject) => {
      config = TrayRenderer.defaultConfig(config)

      const SIZE = config.size * config.pixelRatio
      const PADDING = SIZE * 0.15
      const CENTER = SIZE / 2
      const HAS_COUNT = config.showUnreadCount && config.unreadCount && config.unreadCount < 99
      const color = config.unreadCount ? config.unreadColor : config.readColor
      const backgroundColor = config.unreadCount ? config.unreadBackgroundColor : config.readBackgroundColor

      const canvas = document.createElement('canvas')
      canvas.width = SIZE
      canvas.height = SIZE
      const ctx = canvas.getContext('2d')

      // Circle
      if (!config.thick || config.thick && HAS_COUNT) {
        ctx.beginPath()
        ctx.arc(CENTER, CENTER, (SIZE / 2) - PADDING, 0, 2 * Math.PI, false)
        ctx.fillStyle = backgroundColor
        ctx.fill()
        ctx.lineWidth = SIZE / (config.thick ? 10 : 20)
        ctx.strokeStyle = color
        ctx.stroke()
      }

      // Count or Icon
      if (HAS_COUNT) {
        ctx.fillStyle = color
        ctx.textAlign = 'center'
        if (config.unreadCount < 10) {
          ctx.font = `${config.thick ? 'bold ' : ''}${SIZE * 0.5}px Helvetica`
          ctx.fillText(config.unreadCount, CENTER, CENTER + (SIZE * 0.20))
        } else {
          ctx.font = `${config.thick ? 'bold ' : ''}${SIZE * 0.4}px Helvetica`
          ctx.fillText(config.unreadCount, CENTER, CENTER + (SIZE * 0.15))
        }

        resolve(canvas)
      } else {
        const image = B64_SVG_PREFIX + window.btoa(MAIL_SVG.replace('fill="#000000"', `fill="${color}"`))
        const loader = new window.Image()
        loader.onload = function () {
          const ICON_SIZE = SIZE * (config.thick ? 1.0 : 0.5)
          const POS = (SIZE - ICON_SIZE) / 2
          ctx.drawImage(loader, POS, POS, ICON_SIZE, ICON_SIZE)
          resolve(canvas)
        }
        loader.src = image
      }
    })
  }

  /**
  * Renders the tray icon as a data64 png image
  * @param config: the config for rendering
  * @return promise with the native image
  */
  static renderPNGDataImage (config) {
    config = TrayRenderer.defaultConfig(config)
    return Promise.resolve()
     .then(() => TrayRenderer.renderCanvas(config))
     .then((canvas) => Promise.resolve(canvas.toDataURL('image/png')))
  }

  /**
  * Renders the tray icon as a native image
  * @param config: the config for rendering
  * @return the native image
  */
  static renderNativeImage (config) {
    config = TrayRenderer.defaultConfig(config)
    return Promise.resolve()
      .then(() => TrayRenderer.renderCanvas(config))
      .then((canvas) => {
        const pngData = nativeImage.createFromDataURL(canvas.toDataURL('image/png')).toPng()
        return Promise.resolve(nativeImage.createFromBuffer(pngData, config.pixelRatio))
      })
  }
}

module.exports = TrayRenderer
