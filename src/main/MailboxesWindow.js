'use strict'

const WMailWindow = require('./WMailWindow')
const AuthGoogle = require('./AuthGoogle')
const update = require('./update')
const path = require('path')
const MailboxesSessionManager = require('./MailboxesSessionManager')

class MailboxesWindow extends WMailWindow {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param analytics: the analytics object
  * @param localStorage: the localStorage object
  * @param appSettings: the app settings
  */
  constructor (analytics, localStorage, appSettings) {
    super(analytics, localStorage, appSettings, {
      screenLocationNS: 'mailbox_window_state'
    })
    this.heartbeatInterval = null
    this.authGoogle = new AuthGoogle(appSettings)
    this.sessionManager = new MailboxesSessionManager(this, appSettings)
  }

  start (url) {
    super.start('file://' + path.join(__dirname, '/../mailbox.html'))
  }

  /* ****************************************************************************/
  // Creation & Closing
  /* ****************************************************************************/

  defaultWindowPreferences () {
    return Object.assign(super.defaultWindowPreferences(), {
      minWidth: 955,
      minHeight: 400,
      fullscreenable: true,
      titleBarStyle: this.appSettings.hasTitlebar ? 'default' : 'hidden',
      title: 'WMail',
      webPreferences: {
        nodeIntegration: true
      }
    })
  }

  createWindow () {
    super.createWindow.apply(this, Array.from(arguments))

    // We're locking on to our window. This stops file drags redirecting the page
    this.window.webContents.on('will-navigate', (evt) => {
      evt.preventDefault()
    })

    update.checkNow(this.window)
    this.analytics.appOpened(this.window)
    this.heartbeatInterval = setInterval(() => {
      this.analytics.appHeartbeat(this.window)
    }, 1000 * 60 * 5) // 5 mins
  }

  destroyWindow (evt) {
    super.destroyWindow(evt)
    clearInterval(this.heartbeatInterval)
  }

  /* ****************************************************************************/
  // Mailbox Actions
  /* ****************************************************************************/

  /**
  * Reloads the webview
  */
  reload () {
    this.window.webContents.send('prepare-reload', {})
    setTimeout(() => {
      this.window.webContents.reload()
    }, 250)
  }

  /**
  * Zooms the current mailbox in
  */
  mailboxZoomIn () {
    this.window.webContents.send('mailbox-zoom-in', { })
  }

  /**
  * Zooms the current mailbox out
  */
  mailboxZoomOut () {
    this.window.webContents.send('mailbox-zoom-out', { })
  }

  /**
  * Resets the zoom on the current mailbox
  */
  mailboxZoomReset () {
    this.window.webContents.send('mailbox-zoom-reset', { })
  }

  /**
  * Switches mailbox
  * @param mailboxId: the id of the mailbox to switch to
  */
  switchMailbox (mailboxId) {
    this.window.webContents.send('switch-mailbox', { mailboxId: mailboxId })
  }

  /**
  * Launches the preferences modal
  */
  launchPreferences () {
    this.window.webContents.send('launch-settings', { })
  }

  /**
  * Toggles the sidebar
  */
  toggleSidebar () {
    this.window.webContents.send('toggle-sidebar', { })
  }

  /**
  * Toggles the app menu
  */
  toggleAppMenu () {
    this.window.webContents.send('toggle-app-menu', { })
  }

  /**
  * Tells the frame a download is complete
  * @param path: the path of the saved file
  * @param filename: the name of the file
  */
  downloadCompleted (path, filename) {
    this.window.webContents.send('download-completed', {
      path: path,
      filename: filename
    })
  }

}

module.exports = MailboxesWindow
