const {BrowserWindow} = require('electron')
const EventEmitter = require('events')
const settingStore = require('../stores/settingStore')
const appStorage = require('../storage/appStorage')
const path = require('path')

class WMailWindow extends EventEmitter {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param analytics: the analytics object
  * @param options: object containing the following
  *                   @param screenLocationNS: the namespace to save the window state under. If not set, will not persist
  */
  constructor (analytics, options) {
    super()
    this.analytics = analytics
    this.window = null
    this.windowScreenLocationSaver = null
    this.options = Object.freeze(Object.assign({}, options))
  }

  /**
  * Starts the app
  * @param url: the start url
  * @param windowPreferences=undefined: additional window preferences to supply
  */
  start (url, windowPreferences = undefined) {
    this.createWindow(this.defaultWindowPreferences(windowPreferences), url)
  }

  /* ****************************************************************************/
  // Creation & Closing
  /* ****************************************************************************/

  /**
  * The default window preferences
  * @param extraPreferences = undefined: extra preferences to merge into the prefs
  * @return the settings
  */
  defaultWindowPreferences (extraPreferences = undefined) {
    let icon
    if (process.platform === 'win32') {
      icon = path.join(__dirname, '/../../../icons/app.ico')
    } else if (process.platform === 'linux') {
      icon = path.join(__dirname, '/../../../icons/app.png')
    }

    return Object.assign({
      title: 'WMail',
      icon: icon
    }, extraPreferences)
  }

  /**
  * Creates and launches the window
  * @param settings: the settings to salt the window with
  * @param url: the start url
  */
  createWindow (settings, url) {
    const screenLocation = this.loadWindowScreenLocation()

    // Load up the window location & last state
    this.window = new BrowserWindow(Object.assign(settings, screenLocation))
    if (screenLocation.maximized && settings.show !== false) {
      this.window.maximize()
    }
    if (this.options.screenLocationNS) {
      this.window.on('resize', (evt) => { this.saveWindowScreenLocation() })
      this.window.on('move', (evt) => { this.saveWindowScreenLocation() })
      this.window.on('maximize', (evt) => { this.saveWindowScreenLocation() })
      this.window.on('unmaximize', (evt) => { this.saveWindowScreenLocation() })
    }

    this.window.on('minimize', (evt) => {
      if (settingStore.tray.hideWhenMinimized) {
        this.window.hide()

        evt.preventDefault()
      }
    })

    this[settingStore.ui.showAppMenu ? 'showAppMenu' : 'hideAppMenu']()

    // Bind to change events
    this.window.on('close', (evt) => { this.emit('close', evt) })
    settingStore.on('changed', this.updateWindowMenubar, this)
    this.window.on('closed', (evt) => this.destroyWindow(evt))

    // Fire the whole thing off
    this.window.loadURL(url)
  }

  /**
  * Destroys the window
  * @param evt: the event that caused destroy
  */
  destroyWindow (evt) {
    settingStore.off('changed', this.updateWindowMenubar)

    this.window = null
    this.emit('closed', evt)
  }

  /* ****************************************************************************/
  // Window state
  /* ****************************************************************************/

  /**
  * Saves the window state to disk
  */
  saveWindowScreenLocation () {
    clearTimeout(this.windowScreenLocationSaver)
    this.windowScreenLocationSaver = setTimeout(() => {
      if (this.window.isMinimized()) { return }
      const position = this.window.getPosition()
      const size = this.window.getSize()

      appStorage.setJSONItem(this.options.screenLocationNS, {
        fullscreen: this.window.isFullScreen(),
        maximized: this.window.isMaximized(),
        x: position[0],
        y: position[1],
        width: size[0],
        height: size[1]
      })
    }, 2000)
  }

  /**
  * Loads the window state
  * @return the state
  */
  loadWindowScreenLocation () {
    if (this.options.screenLocationNS) {
      return appStorage.getJSONItem(this.options.screenLocationNS, {})
    }

    return {}
  }

  /**
  * Updates the menubar
  */
  updateWindowMenubar (prev, next) {
    this[settingStore.ui.showAppMenu ? 'showAppMenu' : 'hideAppMenu']()
  }

  /* ****************************************************************************/
  // Actions
  /* ****************************************************************************/

  /**
  * Closes the window respecting any behaviour modifiers that are set
  */
  close () {
    this.window.close()
  }

  /**
  * Shows the window
  */
  show () {
    this.window.show()
  }

  /**
  * Hides the window
  */
  hide () {
    this.window.hide()
  }

  /**
  * Focuses a window
  */
  focus () {
    this.window.focus()
  }

  /**
  * Toggles fullscreen mode
  */
  toggleFullscreen () {
    if (this.window.isFullScreenable()) {
      this.window.setFullScreen(!this.window.isFullScreen())
    } else {
      this.window.maximize(!this.window.isMaximized())
    }
  }

  /**
  * Reloads the webview
  */
  reload () {
    this.window.webContents.reload()
  }

  /**
  * Opens dev tools for this window
  */
  openDevTools () {
    this.window.webContents.openDevTools()
  }

  /**
  * Show the app menu
  */
  showAppMenu () {
    this.window.setMenuBarVisibility(true)
  }

  /**
  * Hide the app menu
  */
  hideAppMenu () {
    this.window.setMenuBarVisibility(false)
  }

  /**
  * @return true if the window is focused
  */
  isFocused () {
    return this.window.isFocused()
  }

  /**
  * @return true if the window is visible
  */
  isVisible () {
    return this.window.isVisible()
  }

  /**
  * Sets the download progress
  * @param v: the download progress to set
  */
  setProgressBar (v) {
    this.window.setProgressBar(v)
  }
}

module.exports = WMailWindow
