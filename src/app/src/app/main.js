;(function () {
  const {ipcMain, dialog, app, shell} = require('electron')

  let windowManager
  const quitting = app.makeSingleInstance(function (commandLine, workingDirectory) {
    const argv = require('yargs').parse(commandLine)
    if (windowManager) {
      if (argv.hidden || argv.hide) {
        windowManager.mailboxesWindow.hide()
      } else {
        if (argv.mailto) {
          windowManager.mailboxesWindow.openMailtoLink(argv.mailto)
        }
        const index = argv._.findIndex((a) => a.indexOf('mailto') === 0)
        if (index !== -1) {
          windowManager.mailboxesWindow.openMailtoLink(argv._[index])
          argv._.splice(1)
        }
        windowManager.mailboxesWindow.show()
        windowManager.mailboxesWindow.focus()
      }
    }
    return true
  })
  if (quitting) {
    app.quit()
    return
  }

  const argv = require('yargs').parse(process.argv)
  const AppAnalytics = require('./AppAnalytics')
  const MailboxesWindow = require('./windows/MailboxesWindow')
  const ContentWindow = require('./windows/ContentWindow')
  const pkg = require('../package.json')
  const AppPrimaryMenu = require('./AppPrimaryMenu')
  const KeyboardShortcuts = require('./KeyboardShortcuts')
  const WindowManager = require('./windows/WindowManager')
  const constants = require('../shared/constants')
  const storage = require('./storage')
  const settingStore = require('./stores/settingStore')

  Object.keys(storage).forEach((k) => storage[k].checkAwake())

  /* ****************************************************************************/
  // Commandline switches & launch args
  /* ****************************************************************************/

  if (settingStore.app.ignoreGPUBlacklist) {
    app.commandLine.appendSwitch('ignore-gpu-blacklist', 'true')
  }
  if (settingStore.app.disableSmoothScrolling) {
    app.commandLine.appendSwitch('disable-smooth-scrolling', 'true')
  }
  if (!settingStore.app.enableUseZoomForDSF) {
    app.commandLine.appendSwitch('enable-use-zoom-for-dsf', 'false')
  }
  const openHidden = (function () {
    if (settingStore.ui.openHidden) { return true }
    if (process.platform === 'darwin' && app.getLoginItemSettings().wasOpenedAsHidden) { return true }
    if (argv.hidden || argv.hide) { return true }
    return false
  })()

  /* ****************************************************************************/
  // Global objects
  /* ****************************************************************************/

  const analytics = new AppAnalytics()
  const mailboxesWindow = new MailboxesWindow(analytics)
  windowManager = new WindowManager(mailboxesWindow)
  const selectors = {
    fullQuit: () => {
      windowManager.quit()
    },
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
    learnMoreGithub: () => { shell.openExternal(constants.GITHUB_URL) },
    learnMore: () => { shell.openExternal(constants.WEB_URL) },
    privacy: () => { shell.openExternal(constants.PRIVACY_URL) },
    bugReport: () => { shell.openExternal(constants.GITHUB_ISSUE_URL) },
    zoomIn: () => { windowManager.mailboxesWindow.mailboxZoomIn() },
    zoomOut: () => { windowManager.mailboxesWindow.mailboxZoomOut() },
    zoomReset: () => { windowManager.mailboxesWindow.mailboxZoomReset() },
    changeMailbox: (mailboxId) => {
      windowManager.mailboxesWindow.show()
      windowManager.mailboxesWindow.focus()
      windowManager.mailboxesWindow.switchMailbox(mailboxId)
    },
    prevMailbox: () => {
      windowManager.mailboxesWindow.show()
      windowManager.mailboxesWindow.focus()
      windowManager.mailboxesWindow.switchPrevMailbox()
    },
    nextMailbox: () => {
      windowManager.mailboxesWindow.show()
      windowManager.mailboxesWindow.focus()
      windowManager.mailboxesWindow.switchNextMailbox()
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
    },
    find: () => { windowManager.mailboxesWindow.findStart() },
    findNext: () => { windowManager.mailboxesWindow.findNext() },
    mailboxNavBack: () => { windowManager.mailboxesWindow.navigateMailboxBack() },
    mailboxNavForward: () => { windowManager.mailboxesWindow.navigateMailboxForward() }
  }
  const appMenu = new AppPrimaryMenu(selectors)
  const keyboardShortcuts = new KeyboardShortcuts(selectors)

  /* ****************************************************************************/
  // IPC Events
  /* ****************************************************************************/

  ipcMain.on('report-error', (evt, body) => {
    analytics.appException(windowManager.mailboxesWindow.window, 'renderer', body.error)
  })

  ipcMain.on('new-window', (evt, body) => {
    const mailboxesWindow = windowManager.mailboxesWindow
    const copyPosition = !mailboxesWindow.window.isFullScreen() && !mailboxesWindow.window.isMaximized()
    const windowOptions = copyPosition ? (() => {
      const position = mailboxesWindow.window.getPosition()
      const size = mailboxesWindow.window.getSize()
      return {
        x: position[0] + 20,
        y: position[1] + 20,
        width: size[0],
        height: size[1]
      }
    })() : undefined
    const window = new ContentWindow(analytics)
    windowManager.addContentWindow(window)
    window.start(body.url, body.partition, windowOptions)
  })

  ipcMain.on('focus-app', (evt, body) => {
    windowManager.focusMailboxesWindow()
  })

  ipcMain.on('toggle-mailbox-visibility-from-tray', (evt, body) => {
    windowManager.toggleMailboxWindowVisibilityFromTray()
  })

  ipcMain.on('show-mailbox-from-tray', (evt, body) => {
    windowManager.showMailboxWindowFromTray()
  })

  ipcMain.on('quit-app', (evt, body) => {
    windowManager.quit()
  })

  ipcMain.on('relaunch-app', (evt, body) => {
    app.relaunch()
    windowManager.quit()
  })

  ipcMain.on('prepare-webview-session', (evt, data) => {
    mailboxesWindow.sessionManager.startManagingSession(data.partition)
  })

  ipcMain.on('mailboxes-js-loaded', (evt, data) => {
    if (argv.mailto) {
      windowManager.mailboxesWindow.openMailtoLink(argv.mailto)
      delete argv.mailto
    } else {
      const index = argv._.findIndex((a) => a.indexOf('mailto') === 0)
      if (index !== -1) {
        windowManager.mailboxesWindow.openMailtoLink(argv._[index])
        argv._.splice(1)
      }
    }
  })

  /* ****************************************************************************/
  // App Events
  /* ****************************************************************************/

  app.on('ready', () => {
    appMenu.updateApplicationMenu()
    windowManager.mailboxesWindow.start(openHidden)
  })

  app.on('window-all-closed', () => {
    app.quit()
  })

  app.on('activate', () => {
    windowManager.mailboxesWindow.show()
  })

  // Keyboard shortcuts in Electron need to be registered and unregistered
  // on focus/blur respectively due to the global nature of keyboard shortcuts.
  // See  https://github.com/electron/electron/issues/1334
  app.on('browser-window-focus', () => {
    keyboardShortcuts.register()
  })
  app.on('browser-window-blur', () => {
    keyboardShortcuts.unregister()
  })

  app.on('before-quit', () => {
    keyboardShortcuts.unregister()
    windowManager.forceQuit = true
  })

  app.on('open-url', (evt, url) => { // osx only
    evt.preventDefault()
    windowManager.mailboxesWindow.openMailtoLink(url)
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
