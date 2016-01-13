"use strict"

const app = require('app')
const BrowserWindow = require('browser-window')
const Menu = require('menu')
const shell = require('shell')
const GoogleAuthServer = require('./auth/GoogleAuthServer')
const CONSTANTS = require('./constants')
const update = require('./update')

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
// Menu
/*****************************************************************************/

/**
* @param selectors: the selectors for the non-standard actions
* @return the menu
*/
function buildMenu(selectors) {
  return Menu.buildFromTemplate([
    {
      label: "Application",
      submenu: [
        { label: "About", selector: "orderFrontStandardAboutPanel:" },
        { type: "separator" },
        { label: "Quit", accelerator: "Command+Q", click: selectors.fullQuit }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle Full Screen', accelerator: 'Ctrl+Command+F', click: selectors.fullscreenToggle },
        { type: "separator" },
        { label: "Reload", accelerator: "CmdOrCtrl+R", click: selectors.reload },
        { label: "Developer Tools", accelerator: "Alt+CmdOrCtrl+J", click: selectors.devTools }
      ]
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' }
      ]
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        { label: 'Project Homepage', click: selectors.learnMore },
        { label: 'Report a Bug', click: selectors.bugReport }
      ]
    },
  ]);
}


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

  // Setup the menu
  Menu.setApplicationMenu(buildMenu({
    fullQuit : () => { fullQuit = true; app.quit() },
    fullscreenToggle : () => { mailboxWindow.setFullScreen(!mailboxWindow.isFullScreen()) },
    reload : () => { mailboxWindow.webContents.reload() },
    devTools : () => { mailboxWindow.webContents.openDevTools() },
    learnMore : () => { shell.openExternal(CONSTANTS.GITHUB_URL) },
    bugReport : () => { shell.openExternal(CONSTANTS.GITHUB_ISSUE_URL) }
  }));

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
})