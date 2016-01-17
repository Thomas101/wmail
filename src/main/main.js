"use strict"

const app = require('app')
const BrowserWindow = require('browser-window')
const Menu = require('menu')
const shell = require('shell')
const googleAuth = require('./auth/googleAuth')
const constants = require('../shared/constants')
const update = require('./update')
const analytics = require('./analytics')
const appMenu = require('./appMenu')
const ipcMain = require('electron').ipcMain

let mailboxWindow
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
  mailboxWindow.loadURL('file://' + __dirname + '/../mailbox.html')

  // Setup the menu & Shortcuts
  const appMenuSelectors = {
    fullQuit : () => { fullQuit = true; app.quit() },
    fullscreenToggle : () => { mailboxWindow.setFullScreen(!mailboxWindow.isFullScreen()) },
    reload : () => { mailboxWindow.webContents.reload() },
    devTools : () => { mailboxWindow.webContents.openDevTools() },
    learnMore : () => { shell.openExternal(constants.GITHUB_URL) },
    bugReport : () => { shell.openExternal(constants.GITHUB_ISSUE_URL) },
    mailbox : (mailboxId) => {
      mailboxWindow.webContents.send('switch-mailbox', {mailboxId:mailboxId })
    }
  }
  Menu.setApplicationMenu(appMenu.build(appMenuSelectors, []))
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

  // Bind to page events
  ipcMain.on('mailboxes-changed', (evt, body) => {
    Menu.setApplicationMenu(appMenu.build(appMenuSelectors, body.mailboxes))
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
    console.error(err)
  })
})