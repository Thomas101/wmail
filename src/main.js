"use strict"

const app = require('app')
const BrowserWindow = require('browser-window')
const Menu = require('menu')
const shell = require('shell')
const GoogleAuthServer = require('./auth/GoogleAuthServer')
const CONSTANTS = require('./constants')
const update = require('./update')
const analytics = require('./analytics')
const appMenu = require('./appMenu')

let mailboxWindow
let googleAuth
let fullQuit = false

/*****************************************************************************/
// App Lifecycle
/*****************************************************************************/
app.on('window-all-closed', function() {
  if(process.platform != 'darwin') { app.quit() }
})

app.on('activate', function(){
  if (mailboxWindow) { mailboxWindow.show() }
});


/*****************************************************************************/
// App Lifecycle : Ready
/*****************************************************************************/
app.on('ready', function() {
  // Create the window
  mailboxWindow = new BrowserWindow({
    width             : 1024,
    height            : 600,
    minWidth          : 955,
    minHeight         : 400,
    titleBarStyle     : 'hidden',
    title             : 'Mailbox',
    webPreferences: {
      nodeIntegration : true
    }
  })
  mailboxWindow.loadURL('file://' + __dirname + '/mailbox/index.html')
  googleAuth = new GoogleAuthServer(mailboxWindow.webContents)

  // Setup the menu & Shortcuts
  Menu.setApplicationMenu(appMenu.build({
    fullQuit : () => { fullQuit = true; app.quit() },
    fullscreenToggle : () => { mailboxWindow.setFullScreen(!mailboxWindow.isFullScreen()) },
    reload : () => { mailboxWindow.webContents.reload() },
    devTools : () => { mailboxWindow.webContents.openDevTools() },
    learnMore : () => { shell.openExternal(CONSTANTS.GITHUB_URL) },
    bugReport : () => { shell.openExternal(CONSTANTS.GITHUB_ISSUE_URL) }
  }));
  appMenu.bindHiddenShortcuts({
    hide : () => { mailboxWindow.hide() }
  })

  //Bind to window events
  mailboxWindow.on('close', (evt) => {
    if (mailboxWindow.isFocused() && !fullQuit) {
      evt.preventDefault()
      mailboxWindow.hide()
    }
  })
  mailboxWindow.on('closed', (evt) => {
    mailboxWindow = null
    app.quit()
  })

  // Save some analytics
  update.checkNow(mailboxWindow)
  analytics.appOpened(mailboxWindow)
  setInterval(() => {
    analytics.appHeartbeat(mailboxWindow)
  }, 1000 * 60 * 5) // 5 mins

  // Send crash reports
  process.on('uncaughtException', err => {
    analytics.appException(mailboxWindow, 'main', err)
  })
})