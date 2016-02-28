'use strict'

const BrowserWindow = require('browser-window')
const EventEmitter = require('events')
const path = require('path')

class WMailWindow extends EventEmitter {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param analytics: the analytics object
  * @param localStorage: the localStorage object
  * @param options: object containing the following
  *                   @param screenLocationNS: the namespace to save the window state under. If not set, will not persist
  */
  constructor (analytics, localStorage, options) {
    super()
    this.analytics = analytics
    this.localStorage = localStorage
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
  // Creation
  /* ****************************************************************************/

  /**
  * The default window preferences
  * @return the settings
  */
  defaultWindowPreferences () {
    return {
      title: 'WMail',
      icon: path.join(__dirname, '/../icons/app.png')
    }
  }

  /**
  * Creates and launches the window
  * @param settings: the settings to salt the window with
  * @param url: the start url
  */
  createWindow (settings, url) {
    const screenLocation = this.loadWindowScreenLocation()
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

    this.window.on('close', (evt) => {
      this.emit('close', evt)
    })
    this.window.on('closed', (evt) => {
      this.window = null
      this.emit('closed', evt)
    })

    this.window.loadURL(url)
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
    this.window.setFullScreen(!this.window.isFullScreen())
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
	* Toggle the menu
	*/
  toggleMenu () {
    this.window.setMenuBarVisibility(!this.window.isMenuBarVisible())
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
