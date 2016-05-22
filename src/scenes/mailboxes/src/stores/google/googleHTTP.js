const google = window.appNodeModulesRequire('googleapis')
const gPlus = google.plus('v1')
const gmail = google.gmail('v1')
const flux = {
  settings: require('../settings')
}

class GoogleHTTP {

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * @return the proxy information
  */
  proxyInformation () {
    const store = flux.settings.S.getState()
    if (store.proxy.enabled) {
      return store.proxy.url
    } else {
      return undefined
    }
  }

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
  // Fetch Profile and overview
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
        auth: auth,
        proxy: this.proxyInformation()
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
  * Syncs the label for a mailbox
  * @param auth: the auth to access google with
  * @param userEmail: the email address of the user
  * @param labelId: the id of the label to sync
  * @return promise
  */
  fetchMailboxLabel (auth, userEmail, labelId) {
    if (!auth) { return this.rejectWithNoAuth(userEmail) }

    return new Promise((resolve, reject) => {
      gmail.users.labels.get({
        userId: userEmail,
        id: labelId,
        auth: auth,
        proxy: this.proxyInformation()
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
  * @param email: the email address to use
  * @param query: the query to ask the server for
  * @return promise
  */
  fetchEmailSummaries (auth, email, query) {
    if (!auth) { return this.rejectWithNoAuth(email) }

    return new Promise((resolve, reject) => {
      gmail.users.messages.list({
        userId: email,
        q: query,
        auth: auth,
        proxy: this.proxyInformation()
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
  * @param email: the email address of the account
  * @param emailId: the id of the email
  * @return promise
  */
  fetchEmail (auth, email, messageId) {
    if (!auth) { return this.rejectWithNoAuth(email) }

    return new Promise((resolve, reject) => {
      gmail.users.messages.get({
        userId: email,
        id: messageId,
        auth: auth,
        proxy: this.proxyInformation()
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
