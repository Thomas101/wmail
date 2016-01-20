'use strict'

const app = require('app')
const BrowserWindow = require('browser-window')
const Menu = require('menu')
const shell = require('shell')
const AuthGoogle = require('./AuthGoogle')
const constants = require('../shared/constants')
const update = require('./update')
const appMenu = require('./appMenu')
const ipcMain = require('electron').ipcMain

class WMail {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param injected items
  */
  constructor (injection) {
    this.authGoogle = new AuthGoogle()
    this.analytics = injection.analytics
    this.localStorage = injection.localStorage
    this.mailboxWindow = null
    this.fullQuit = null
    this.mailboxWindowSaver = null
    this.appMenuSelectors = {
      fullQuit: () => { this.fullQuit = true; app.quit() },
      fullscreenToggle: () => { this.mailboxWindow.setFullScreen(!this.mailboxWindow.isFullScreen()) },
      reload: () => { this.mailboxWindow.webContents.reload() },
      devTools: () => { this.mailboxWindow.webContents.openDevTools() },
      learnMore: () => { shell.openExternal(constants.GITHUB_URL) },
      bugReport: () => { shell.openExternal(constants.GITHUB_ISSUE_URL) },
      zoomIn: () => { this.mailboxWindow.webContents.send('mailbox-zoom-in', { }) },
      zoomOut: () => { this.mailboxWindow.webContents.send('mailbox-zoom-out', { }) },
      zoomReset: () => { this.mailboxWindow.webContents.send('mailbox-zoom-reset', { }) },
      mailbox: (mailboxId) => {
        this.mailboxWindow.webContents.send('switch-mailbox', {
          mailboxId: mailboxId
        })
      }
    }
  }

  /**
  * Starts the app
  */
  start () {
    this.createMailboxWindow()
    this.createAppMenu()
    this.listenToIPC()
    this.startUpdatesAnalytics()
  }

  /* ****************************************************************************/
  // Mailbox window
  /* ****************************************************************************/

  /**
  * Creates and shows the mailbox window
  */
  createMailboxWindow () {
    this.mailboxWindow = new BrowserWindow(Object.assign({
      minWidth: 955,
      minHeight: 400,
      titleBarStyle: 'hidden',
      title: 'Mailbox',
      webPreferences: {
        nodeIntegration: true
      }
    }, this.loadWindowState()))
    this.mailboxWindow.loadURL('file://' + __dirname + '/../mailbox.html')

    // Bind to window events
    this.mailboxWindow.on('close', (evt) => {
      if (this.mailboxWindow.isFocused() && !this.fullQuit) {
        evt.preventDefault()
        this.mailboxWindow.hide()
      }
    })
    this.mailboxWindow.on('closed', (evt) => {
      this.mailboxWindow = null
      app.quit()
    })
    this.mailboxWindow.on('resize', (evt) => {
      this.saveWindowState()
    })
    this.mailboxWindow.on('move', (evt) => {
      this.saveWindowState()
    })
    this.mailboxWindow.webContents.on('will-navigate', (evt) => {
      // We're locking on to our window. This stops file drags redirecting the page
      evt.preventDefault()
    })
  }

  /**
  * Saves the window state to disk
  */
  saveWindowState () {
    clearTimeout(this.mailboxWindowSaver)
    this.mailboxWindowSaver = setTimeout(() => {
      const state = {
        fullscreen: this.mailboxWindow.isMaximized()
      }
      if (!this.mailboxWindow.isMaximized() && !this.mailboxWindow.isMinimized()) {
        const position = this.mailboxWindow.getPosition()
        const size = this.mailboxWindow.getSize()
        state.x = position[0]
        state.y = position[1]
        state.width = size[0]
        state.height = size[1]
      }

      this.localStorage.setItem('mailbox_window_state', JSON.stringify(state))
    }, 2000)
  }

  /**
  * Loads the window state
  * @return the state
  */
  loadWindowState () {
    if (this.localStorage.getItem('mailbox_window_state')) {
      return JSON.parse(this.localStorage.getItem('mailbox_window_state'))
    } else {
      return {
        width: 1024,
        height: 600,
        fullscreen: false
      }
    }
  }

  /* ****************************************************************************/
  // App Menu
  /* ****************************************************************************/

  /**
  * Creates the app menu and corresponding shortcuts
  */
  createAppMenu () {
    Menu.setApplicationMenu(appMenu.build(this.appMenuSelectors, []))
    appMenu.bindHiddenShortcuts(this.appMenuSelectors)
  }

  /* ****************************************************************************/
  // IPC
  /* ****************************************************************************/

  /**
  * Listens to the render from
  */
  listenToIPC () {
    ipcMain.on('mailboxes-changed', (evt, body) => {
      Menu.setApplicationMenu(appMenu.build(this.appMenuSelectors, body.mailboxes))
    })
    ipcMain.on('report-error', (evt, body) => {
      this.analytics.appException(this.mailboxWindow, 'renderer', body.error)
    })
  }

  /* ****************************************************************************/
  // App
  /* ****************************************************************************/

  /**
  * Starts the update checker and analytics
  */
  startUpdatesAnalytics () {
    update.checkNow(this.mailboxWindow)
    this.analytics.appOpened(this.mailboxWindow)
    setInterval(() => {
      this.analytics.appHeartbeat(this.mailboxWindow)
    }, 1000 * 60 * 5) // 5 mins
  }
}

module.exports = WMail
