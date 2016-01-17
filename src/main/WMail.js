"use strict"

const app = require('app')
const BrowserWindow = require('browser-window')
const Menu = require('menu')
const shell = require('shell')
const googleAuth = require('./googleAuth')
const constants = require('../shared/constants')
const update = require('./update')
const analytics = require('./analytics')
const appMenu = require('./appMenu')
const ipcMain = require('electron').ipcMain

class WMail {

	/*****************************************************************************/
	// Lifecycle
	/*****************************************************************************/

  constructor() {
    this.mailboxWindow = null
    this.fullQuit = null
    this.appMenuSelectors = {
	    fullQuit : () => { this.fullQuit = true; app.quit() },
	    fullscreenToggle : () => { this.mailboxWindow.setFullScreen(!this.mailboxWindow.isFullScreen()) },
	    reload : () => { this.mailboxWindow.webContents.reload() },
	    devTools : () => { this.mailboxWindow.webContents.openDevTools() },
	    learnMore : () => { shell.openExternal(constants.GITHUB_URL) },
	    bugReport : () => { shell.openExternal(constants.GITHUB_ISSUE_URL) },
	    mailbox : (mailboxId) => {
	      this.mailboxWindow.webContents.send('switch-mailbox', {mailboxId:mailboxId })
	    }
	  }
  }

  /**
  * Starts the app
  */
  start() {
  	this.createMailboxWindow()
  	this.createAppMenu()
  	this.listenToIPC()
  	this.startUpdatesAnalytics()
  }

  /*****************************************************************************/
	// Mailbox window
	/*****************************************************************************/

	/**
	* Creates and shows the mailbox window
	*/
  createMailboxWindow() {
  	this.mailboxWindow = new BrowserWindow({
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
	  this.mailboxWindow.loadURL('file://' + __dirname + '/../mailbox.html')

	  //Bind to window events
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
  }

  /*****************************************************************************/
	// App Menu
	/*****************************************************************************/

	/**
	* Creates the app menu and corresponding shortcuts
	*/
  createAppMenu() {
	  Menu.setApplicationMenu(appMenu.build(this.appMenuSelectors, []))
	  appMenu.bindHiddenShortcuts({
	    hide : () => { this.mailboxWindow.hide() }
	  })
  }

  /*****************************************************************************/
	// IPC
	/*****************************************************************************/

	/**
	* Listens to the render from
	*/
  listenToIPC() {
  	ipcMain.on('mailboxes-changed', (evt, body) => {
	    Menu.setApplicationMenu(appMenu.build(this.appMenuSelectors, body.mailboxes))
	  })
  }

  /*****************************************************************************/
	// App
	/*****************************************************************************/

	/**
	* Starts the update checker and analytics
	*/
  startUpdatesAnalytics() {
	  update.checkNow(this.mailboxWindow)
	  analytics.appOpened(this.mailboxWindow)
	  setInterval(() => {
	    analytics.appHeartbeat(this.mailboxWindow)
	  }, 1000 * 60 * 5) // 5 mins
  }
}

module.exports = WMail