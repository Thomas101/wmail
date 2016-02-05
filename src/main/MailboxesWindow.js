'use strict'

const WMailWindow = require('./WMailWindow')
const AuthGoogle = require('./AuthGoogle')
const update = require('./update')

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
    super(analytics, localStorage, {
      screenLocationNS: 'mailbox_window_state'
    })
    this.heartbeatInterval = null
    this.authGoogle = new AuthGoogle(appSettings)
    this.appSettings = appSettings
  }

  start (url) {
    super.start('file://' + __dirname + '/../mailbox.html')
  }

  /* ****************************************************************************/
  // Creation
  /* ****************************************************************************/

  defaultWindowPreferences () {
    return Object.assign(super.defaultWindowPreferences(), {
      minWidth: 955,
      minHeight: 400,
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

    this.window.on('closed', (evt) => {
      clearInterval(this.heartbeatInterval)
    })
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

}

module.exports = MailboxesWindow
