const google = window.appNodeModulesRequire('googleapis')
const gPlus = google.plus('v1')
const gmail = google.gmail('v1')
const OAuth2 = google.auth.OAuth2
const GoogleHTTPTransporter = require('./GoogleHTTPTransporter')
const querystring = require('querystring')
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require('shared/credentials')

class GoogleHTTP {

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Rejects a call because the mailbox has no authentication info
  * @param info: any information we have
  * @return promise - rejected
  */
  rejectWithNoAuth (info) {
    return Promise.reject({
      info: info,
      err: 'Local - Mailbox missing authentication information'
    })
  }

  /* **************************************************************************/
  // Auth
  /* **************************************************************************/

  /**
  * Generates the auth token object to use with Google
  * @param accessToken: the access token from the mailbox
  * @param refreshToken: the refresh token from the mailbox
  * @param expiryTime: the expiry time from the mailbox
  * @return the google auth object
  */
  generateAuth (accessToken, refreshToken, expiryTime) {
    const auth = new OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
    auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: expiryTime
    })
    auth.transporter = new GoogleHTTPTransporter()
    return auth
  }

  /**
  * Upgrades the initial temporary access code to a permenant access code
  * @param authCode: the temporary auth code
  * @return promise
  */
  upgradeAuthCodeToPermenant (authCode) {
    return Promise.resolve()
      .then(() => window.fetch('https://accounts.google.com/o/oauth2/token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: querystring.stringify({
          code: authCode,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          grant_type: 'authorization_code',
          redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
        })
      }))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
  }

  /* **************************************************************************/
  // Fetch Profile
  /* **************************************************************************/

  /**
  * Syncs a profile for a mailbox
  * @param auth: the auth to access google with
  * @return promise
  */
  fetchMailboxProfile (auth) {
    if (!auth) { return this.rejectWithNoAuth() }

    return new Promise((resolve, reject) => {
      gPlus.people.get({
        userId: 'me',
        auth: auth
      }, (err, response) => {
        if (err) {
          reject({ err: err })
        } else {
          resolve({ response: response })
        }
      })
    })
  }

  /* **************************************************************************/
  // Label
  /* **************************************************************************/

  /**
  * Syncs the label for a mailbox. The label is a cheap call which can be used
  * to decide if the mailbox has changed
  * @param auth: the auth to access google with
  * @param labelId: the id of the label to sync
  * @return promise
  */
  fetchMailboxLabel (auth, labelId) {
    if (!auth) { return this.rejectWithNoAuth() }

    return new Promise((resolve, reject) => {
      gmail.users.labels.get({
        userId: 'me',
        id: labelId,
        auth: auth
      }, (err, response) => {
        if (err) {
          reject({ err: err })
        } else {
          resolve({ response: response })
        }
      })
    })
  }

  /* **************************************************************************/
  // Fetch Emails and messages
  /* **************************************************************************/

  /**
  * Fetches the unread summaries for a mailbox
  * @param auth: the auth to access google with
  * @param query: the query to ask the server for
  * @param limit=10: the limit on results to fetch
  * @return promise
  */
  fetchThreadIds (auth, query, limit = 25) {
    if (!auth) { return this.rejectWithNoAuth() }

    return new Promise((resolve, reject) => {
      gmail.users.threads.list({
        userId: 'me',
        q: query,
        maxResults: limit,
        auth: auth
      }, (err, response) => {
        if (err) {
          reject({ err: err })
        } else {
          resolve({ response: response })
        }
      })
    })
  }

  /**
  * Fetches an email from a given id
  * @param auth: the auth to access google with
  * @param threadId: the id of the thread
  * @return promise
  */
  fetchThread (auth, threadId) {
    if (!auth) { return this.rejectWithNoAuth() }

    return new Promise((resolve, reject) => {
      gmail.users.threads.get({
        userId: 'me',
        id: threadId,
        auth: auth
      }, (err, response) => {
        if (err) {
          reject({ err: err })
        } else {
          resolve({ response: response })
        }
      })
    })
  }
}

module.exports = new GoogleHTTP()
