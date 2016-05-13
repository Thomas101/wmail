'use strict'

const path = require('path')
const ipcMain = require('electron').ipcMain
const electronGoogleOauth = require('electron-google-oauth')
const credentials = require('../shared/credentials')
const HttpsProxyAgent = require('https-proxy-agent')

class AuthGoogle {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param appSettings: the settings for the app
  */
  constructor (appSettings) {
    this.appSettings = appSettings

    ipcMain.on('auth-google', (evt, body) => {
      this.handleAuthGoogle(evt, body)
    })
  }

  /* ****************************************************************************/
  // Request Handlers
  /* ****************************************************************************/

  /**
  * Handles the oauth request
  * @param evt: the incoming event
  * @param body: the body sent to us
  */
  handleAuthGoogle (evt, body) {
    let proxyAgent
    if (this.appSettings.proxyEnabled) {
      proxyAgent = new HttpsProxyAgent(this.appSettings.proxyUrl)
    }

    electronGoogleOauth(undefined, {
      useContentSize: true,
      center: true,
      show: true,
      resizable: false,
      alwaysOnTop: true,
      standardWindow: true,
      autoHideMenuBar: true,
      title: 'Google',
      webPreferences: {
        nodeIntegration: false,
        partition: 'persist:' + body.id
      }
    }, proxyAgent).getAccessToken(
      [
        'https://www.googleapis.com/auth/plus.me',
        'profile',
        'email',
        'https://www.googleapis.com/auth/gmail.readonly'
      ],
      credentials.GOOGLE_CLIENT_ID,
      credentials.GOOGLE_CLIENT_SECRET
    ).then((auth) => {
      evt.sender.send('auth-google-complete', {
        id: body.id,
        type: body.type,
        auth: auth
      })
    }, (err) => {
      evt.sender.send('auth-google-error', {
        id: body.id,
        type: body.type,
        error: err,
        errorString: (err || {}).toString ? (err || {}).toString() : undefined,
        errorMessage: (err || {}).message ? (err || {}).message : undefined,
        errorStack: (err || {}).stack ? (err || {}).stack : undefined
      })
    })
  }
}

module.exports = AuthGoogle
