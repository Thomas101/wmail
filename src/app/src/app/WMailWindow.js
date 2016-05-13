const {BrowserWindow} = require('electron')
const EventEmitter = require('events')

class WMailWindow extends EventEmitter {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param analytics: the analytics object
  * @param localStorage: the localStorage object
  * @param appSettings: the app settings so window preferences can be siphoned
  * @param options: object containing the following
  *                   @param screenLocationNS: the namespace to save the window state under. If not set, will not persist
  */
  constructor (analytics, localStorage, appSettings, options) {
    super()
    this.analytics = analytics
    this.localStorage = localStorage
    this.appSettings = appSettings
    this.window = null
    this.windowScreenLocationSaver = null
    this.options = Object.freeze(Object.assign({}, options))
  }

  /**
  * Starts the app
  * @param url: the start url
  */
  start (url) {
    this.createWindow(this.defaultWindowPreferences(), url)
  }

  /* ****************************************************************************/
  // Creation & Closing
  /* ****************************************************************************/

  /**
  * The default window preferences
  * @return the settings
  */
  defaultWindowPreferences () {
    return {
      title: 'WMail'
    }
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
    if (screenLocation.maximized) {
      this.window.maximize()
    }
    if (this.options.screenLocationNS) {
      this.window.on('resize', (evt) => { this.saveWindowScreenLocation() })
      this.window.on('move', (evt) => { this.saveWindowScreenLocation() })
      this.window.on('maximize', (evt) => { this.saveWindowScreenLocation() })
      this.window.on('unmaximize', (evt) => { this.saveWindowScreenLocation() })
    }
    this[this.appSettings.hasAppMenu ? 'showAppMenu' : 'hideAppMenu']()

    // Bind to change events
    this.window.on('close', (evt) => { this.emit('close', evt) })
    this.appSettings.on('changed', this.updateWindowMenubar, this)
    this.window.on('closed', (evt) => this.destroyWindow(evt))

    // Fire the whole thing off
    this.window.loadURL(url)
  }

  /**
  * Destroys the window
  * @param evt: the event that caused destroy
  */
  destroyWindow (evt) {
    this.appSettings.off('changed', this.updateWindowMenubar)

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
      const state = {
        fullscreen: this.window.isFullScreen(),
        maximized: this.window.isMaximized()
      }
      if (!this.window.isMaximized() && !this.window.isMinimized()) {
        const position = this.window.getPosition()
        const size = this.window.getSize()
        state.x = position[0]
        state.y = position[1]
        state.width = size[0]
        state.height = size[1]
      }

      this.localStorage.setItem(this.options.screenLocationNS, JSON.stringify(state))
    }, 2000)
  }

  /**
  * Loads the window state
  * @return the state
  */
  loadWindowScreenLocation () {
    if (this.options.screenLocationNS) {
      if (this.localStorage.getItem(this.options.screenLocationNS)) {
        return JSON.parse(this.localStorage.getItem(this.options.screenLocationNS))
      }
    }

    return {}
  }

  /**
  * Updates the menubar
  */
  updateWindowMenubar (prev, next) {
    this[this.appSettings.hasAppMenu ? 'showAppMenu' : 'hideAppMenu']()
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
