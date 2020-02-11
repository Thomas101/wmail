const WMailWindow = require('./WMailWindow')
const AuthGoogle = require('../AuthGoogle')
const path = require('path')
const MailboxesSessionManager = require('./MailboxesSessionManager')
const settingStore = require('../stores/settingStore')

const MAILBOXES_DIR = path.resolve(path.join(__dirname, '/../../../scenes/mailboxes'))
const ALLOWED_URLS = new Set([
  'file://' + path.join(MAILBOXES_DIR, 'mailboxes.html'),
  'file://' + path.join(MAILBOXES_DIR, 'offline.html')
])

class MailboxesWindow extends WMailWindow {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param analytics: the analytics object
  */
  constructor (analytics) {
    super(analytics, {
      screenLocationNS: 'mailbox_window_state'
    })
    this.heartbeatInterval = null
    this.authGoogle = new AuthGoogle()
    this.sessionManager = new MailboxesSessionManager(this)
  }

  /**
  * @param url: the url to load
  * @param hidden=false: true to start the window hidden
  */
  start (hidden = false) {
    super.start('file://' + path.join(MAILBOXES_DIR, 'mailboxes.html'), {
      show: !hidden,
      minWidth: 770,
      minHeight: 300,
      fullscreenable: true,
      titleBarStyle: settingStore.ui.showTitlebar ? 'default' : 'hidden',
      title: 'WMail',
      backgroundColor: '#f2f2f2',
      webPreferences: {
        nodeIntegration: true
      }
    })
  }

  /* ****************************************************************************/
  // Creation & Closing
  /* ****************************************************************************/

  createWindow () {
    super.createWindow.apply(this, Array.from(arguments))

    // We're locking on to our window. This stops file drags redirecting the page
    this.window.webContents.on('will-navigate', (evt, url) => {
      if (!ALLOWED_URLS.has(url)) {
        evt.preventDefault()
      }
    })

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
  * Switches to the previous mailbox
  */
  switchPrevMailbox () {
    this.window.webContents.send('switch-mailbox', { prev: true })
  }

  /**
  * Switches to the next mailbox
  */
  switchNextMailbox () {
    this.window.webContents.send('switch-mailbox', { next: true })
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

  /**
  * Starts finding in the mailboxes window
  */
  findStart () {
    this.window.webContents.send('mailbox-window-find-start', { })
  }

  /**
  * Finds the next in the mailbox window
  */
  findNext () {
    this.window.webContents.send('mailbox-window-find-next', { })
  }

  /**
  * Tells the active mailbox to navigate back
  */
  navigateMailboxBack () {
    this.window.webContents.send('mailbox-window-navigate-back', { })
  }

  /**
  * Tells the active mailbox to navigate back
  */
  navigateMailboxForward () {
    this.window.webContents.send('mailbox-window-navigate-forward', { })
  }

  /**
  * Opens a mailto link
  * @param mailtoLink: the link to open
  */
  openMailtoLink (mailtoLink) {
    this.window.webContents.send('open-mailto-link', { mailtoLink: mailtoLink })
  }

}

module.exports = MailboxesWindow
