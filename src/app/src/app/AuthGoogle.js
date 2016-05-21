const {ipcMain, BrowserWindow} = require('electron')
const googleapis = require('googleapis')
const fetch = require('node-fetch')
const credentials = require('../shared/credentials')
const HttpsProxyAgent = require('https-proxy-agent')
const APP_REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'
const settingStore = require('./stores/settingStore')

class AuthGoogle {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    ipcMain.on('auth-google', (evt, body) => {
      this.handleAuthGoogle(evt, body)
    })
  }

  /* ****************************************************************************/
  // Authentication
  /* ****************************************************************************/

  /**
  * Generates the authentication url for our secrets, scopes and access type
  * @return the url that can be used to authenticate with goog
  */
  generateAuthenticationURL () {
    const oauth2Client = new googleapis.auth.OAuth2(
      credentials.GOOGLE_CLIENT_ID,
      credentials.GOOGLE_CLIENT_SECRET,
      APP_REDIRECT_URI
    )
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/plus.me',
        'profile',
        'email',
        'https://www.googleapis.com/auth/gmail.readonly'
      ]
    })
    return url
  }

  /**
  * Gets the authorization code by prompting the user to sign in
  * @param partitionId: the id of the partition
  * @return promise
  */
  promptUserToGetAuthorizationCode (partitionId) {
    return new Promise((resolve, reject) => {
      const oauthWin = new BrowserWindow({
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
          partition: partitionId.indexOf('persist:') === 0 ? partitionId : 'persist:' + partitionId
        }
      })
      oauthWin.loadURL(this.generateAuthenticationURL())

      // Bind some events
      oauthWin.on('closed', () => {
        reject(new Error('User closed the window'))
      })
      oauthWin.on('page-title-updated', (evt) => {
        setTimeout(() => {
          const title = oauthWin.getTitle()
          if (title.startsWith('Denied')) {
            reject(new Error(title.split(/[ =]/)[2]))
            oauthWin.removeAllListeners('closed')
            oauthWin.close()
          } else if (title.startsWith('Success')) {
            resolve(title.split(/[ =]/)[2])
            oauthWin.removeAllListeners('closed')
            oauthWin.close()
          }
        })
      })
    })
  }

  /**
  * Gets the permenant access token from an auth code
  * @param authCode: the auth code to elevate
  * @return promise
  */
  getPermenantAccessTokenFromAuthCode (authCode) {
    const proxyAgent = settingStore.proxy.enabled ? new HttpsProxyAgent(settingStore.proxy.url) : undefined
    const query = {
      code: authCode,
      client_id: credentials.GOOGLE_CLIENT_ID,
      client_secret: credentials.GOOGLE_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: APP_REDIRECT_URI
    }
    const payload = Object.keys(query)
      .map((key) => `${key}=${encodeURIComponent(query[key])}`)
      .join('&')

    return Promise.resolve()
      .then(() => fetch('https://accounts.google.com/o/oauth2/token', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload,
        agent: proxyAgent
      }))
      .then((res) => res.json())
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
    Promise.resolve()
      .then(() => this.promptUserToGetAuthorizationCode(body.id))
      .then((authCode) => this.getPermenantAccessTokenFromAuthCode(authCode))
      .then((auth) => {
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
