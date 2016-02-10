'use strict'

const app = require('app')
const AppAnalytics = require('./AppAnalytics')
const AppDirectory = require('appdirectory')
const LocalStorage = require('node-localstorage').LocalStorage
const MailboxesWindow = require('./MailboxesWindow')
const ContentWindow = require('./ContentWindow')
const pkg = require('../package.json')
const electron = require('electron')
const ipcMain = electron.ipcMain
const dialog = electron.dialog
const appMenu = require('./appMenu')
const Menu = require('menu')
const shell = require('shell')
const WindowManager = require('./WindowManager')
const constants = require('../shared/constants')
const exec = require('child_process').exec
const AppSettings = require('./AppSettings')
const MailboxesDownloadManager = require('./MailboxesDownloadManager')

/* ****************************************************************************/
// Global objects
/* ****************************************************************************/

const appDirectory = new AppDirectory(pkg.name)
const localStorage = new LocalStorage(appDirectory.userData())
const appSettings = new AppSettings(localStorage)
const analytics = new AppAnalytics(localStorage, appSettings)
const mailboxesWindow = new MailboxesWindow(analytics, localStorage, appSettings)
const mailboxesDownloadManager = new MailboxesDownloadManager(mailboxesWindow)
const windowManager = new WindowManager(mailboxesWindow)

const appMenuSelectors = {
  fullQuit: () => { windowManager.quit() },
  closeWindow: () => {
    const focused = windowManager.focused()
    focused ? focused.close() : undefined
  },
  fullscreenToggle: () => {
    const focused = windowManager.focused()
    focused ? focused.toggleFullscreen() : undefined
  },
  sidebarToggle: () => {
    windowManager.mailboxesWindow.toggleSidebar()
  },
  preferences: () => {
    windowManager.mailboxesWindow.launchPreferences()
  },
  reload: () => {
    const focused = windowManager.focused()
    focused ? focused.reload() : undefined
  },
  devTools: () => {
    const focused = windowManager.focused()
    focused ? focused.openDevTools() : undefined
  },
  learnMore: () => { shell.openExternal(constants.GITHUB_URL) },
  bugReport: () => { shell.openExternal(constants.GITHUB_ISSUE_URL) },
  zoomIn: () => { windowManager.mailboxesWindow.mailboxZoomIn() },
  zoomOut: () => { windowManager.mailboxesWindow.mailboxZoomOut() },
  zoomReset: () => { windowManager.mailboxesWindow.mailboxZoomReset() },
  mailbox: (mailboxId) => { windowManager.mailboxesWindow.switchMailbox(mailboxId) },
  cycleWindows: () => { windowManager.focusNextWindow() },
  aboutDialog: () => {
    dialog.showMessageBox({
      title: pkg.name,
      message: pkg.name,
      detail: [
        'Version: ' + pkg.version + (pkg.prerelease ? ' prerelease' : ''),
        'Made with ♥ by Thomas Beverley.'
      ].join('\n'),
      buttons: [ 'Done', 'Website' ]
    }, (index) => {
      if (index === 1) {
        shell.openExternal(constants.GITHUB_URL)
      }
    })
  }
}

/* ****************************************************************************/
// IPC Events
/* ****************************************************************************/

ipcMain.on('mailboxes-changed', (evt, body) => {
  Menu.setApplicationMenu(appMenu.build(appMenuSelectors, body.mailboxes))
})

ipcMain.on('report-error', (evt, body) => {
  analytics.appException(windowManager.mailboxesWindow.window, 'renderer', body.error)
})

ipcMain.on('new-window', (evt, body) => {
  const window = new ContentWindow(analytics, localStorage)
  windowManager.addContentWindow(window)
  window.start(body.url, body.partition)
})

ipcMain.on('restart-app', (evt, body) => {
  exec('"' + process.execPath.replace(/\"/g, '\\"') + '"')
  windowManager.quit()
})

ipcMain.on('settings-update', (evt, settings) => {
  appSettings.update(settings)
})

ipcMain.on('download-progress', (evt, data) => {
  mailboxesDownloadManager.updateProgress(data.id, data.received, data.total)
})

ipcMain.on('download-complete', (evt, data) => {
  mailboxesDownloadManager.downloadFinished(data.id)
})

/* ****************************************************************************/
// App Events
/* ****************************************************************************/

app.on('ready', () => {
  Menu.setApplicationMenu(appMenu.build(appMenuSelectors, []))
  windowManager.mailboxesWindow.start()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  windowManager.mailboxesWindow.show()
})

/* ****************************************************************************/
// Exceptions
/* ****************************************************************************/

// Send crash reports
process.on('uncaughtException', err => {
  analytics.appException(windowManager.mailboxesWindow.window, 'main', err)
  console.error(err)
  console.error(err.stack)
})
