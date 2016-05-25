;(function () {
  const {ipcMain, dialog, app, Menu, shell} = require('electron')

  let windowManager
  const quitting = app.makeSingleInstance(function (commandLine, workingDirectory) {
    if (windowManager) {
      windowManager.mailboxesWindow.show()
      windowManager.mailboxesWindow.focus()
    }
    return true
  })
  if (quitting) {
    app.quit()
    return
  }

  const AppAnalytics = require('./AppAnalytics')
  const AppDirectory = require('appdirectory')
  const Storage = require('dom-storage')
  const MailboxesWindow = require('./MailboxesWindow')
  const ContentWindow = require('./ContentWindow')
  const pkg = require('../package.json')
  const appMenu = require('./appMenu')
  const WindowManager = require('./WindowManager')
  const constants = require('../shared/constants')
  const path = require('path')
  const mkdirp = require('mkdirp')
  const mailboxStore = require('./stores/mailboxStore')

  /* ****************************************************************************/
  // Global objects
  /* ****************************************************************************/

  const appDirectory = new AppDirectory(pkg.name)
  mkdirp.sync(appDirectory.userData())

  const localStorage = new Storage(path.join(appDirectory.userData(), 'main_proc_db.json'))
  const analytics = new AppAnalytics(localStorage)
  const mailboxesWindow = new MailboxesWindow(analytics, localStorage)
  windowManager = new WindowManager(mailboxesWindow)

  const appMenuSelectors = {
    fullQuit: () => { windowManager.quit() },
    closeWindow: () => {
      const focused = windowManager.focused()
      focused ? focused.close() : undefined
    },
    showWindow: () => {
      windowManager.mailboxesWindow.show()
      windowManager.mailboxesWindow.focus()
    },
    fullscreenToggle: () => {
      const focused = windowManager.focused()
      focused ? focused.toggleFullscreen() : undefined
    },
    sidebarToggle: () => {
      windowManager.mailboxesWindow.toggleSidebar()
    },
    menuToggle: () => {
      windowManager.mailboxesWindow.toggleAppMenu()
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
    mailbox: (mailboxId) => {
      windowManager.mailboxesWindow.show()
      windowManager.mailboxesWindow.focus()
      windowManager.mailboxesWindow.switchMailbox(mailboxId)
    },
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
  // Events
  /* ****************************************************************************/

  mailboxStore.on('changed', () => {
    Menu.setApplicationMenu(appMenu.build(appMenuSelectors))
  })

  /* ****************************************************************************/
  // IPC Events
  /* ****************************************************************************/

  ipcMain.on('report-error', (evt, body) => {
    analytics.appException(windowManager.mailboxesWindow.window, 'renderer', body.error)
  })

  ipcMain.on('new-window', (evt, body) => {
    const window = new ContentWindow(analytics, localStorage)
    windowManager.addContentWindow(window)
    window.start(body.url, body.partition)
  })

  ipcMain.on('focus-app', (evt, body) => {
    windowManager.focusMailboxesWindow()
  })

  ipcMain.on('quit-app', (evt, body) => {
    windowManager.quit()
  })

  ipcMain.on('prepare-webview-session', (evt, data) => {
    mailboxesWindow.sessionManager.startManagingSession(data.partition)
  })

  /* ****************************************************************************/
  // App Events
  /* ****************************************************************************/

  app.on('ready', () => {
    Menu.setApplicationMenu(appMenu.build(appMenuSelectors))
    windowManager.mailboxesWindow.start()
  })

  app.on('window-all-closed', function () {
    app.quit()
  })

  app.on('activate', function () {
    windowManager.mailboxesWindow.show()
  })

  /* ****************************************************************************/
  // Exceptions
  /* ****************************************************************************/

  // Send crash reports
  process.on('uncaughtException', (err) => {
    analytics.appException(windowManager.mailboxesWindow.window, 'main', err)
    console.error(err)
    console.error(err.stack)
  })
})()
