'use strict'

const app = require('app')
const AppAnalytics = require('./AppAnalytics')
const AppDirectory = require('appdirectory')
const LocalStorage = require('node-localstorage').LocalStorage
const WMail = require('./WMail')
const pkg = require('../package.json')

const appDirectory = new AppDirectory(pkg.name)
const localStorage = new LocalStorage(appDirectory.userData())
const analytics = new AppAnalytics(localStorage)
const wmail = new WMail({
  localStorage: localStorage,
  analytics: analytics
})

app.on('ready', () => {
  wmail.start()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (wmail.mailboxWindow) { wmail.mailboxWindow.show() }
})

// Send crash reports
process.on('uncaughtException', err => {
  analytics.appException(wmail.mailboxWindow, 'main', err)
  console.error(err)
})
