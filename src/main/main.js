"use strict"

const app = require('app')
const analytics = require('./analytics')
const WMail = require('./WMail')


const wmail = new WMail()
app.on('ready', () => {
  wmail.start()
})
app.on('window-all-closed', function() {
  if(process.platform != 'darwin') { app.quit() }
})

app.on('activate', function(){
  if (wmail.mailboxWindow) { wmail.mailboxWindow.show() }
})

// Send crash reports
process.on('uncaughtException', err => {
  analytics.appException(wmail.mailboxWindow, 'main', err)
  console.error(err)
})