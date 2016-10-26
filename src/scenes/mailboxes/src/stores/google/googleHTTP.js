const google = window.appNodeModulesRequire('googleapis')
const gPlus = google.plus('v1')
const gmail = google.gmail('v1')
const flux = { settings: require('../settings') }

class GoogleHTTP {

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Ensures the proxy is setup
  */
  ensureProxy () {
    const store = flux.settings.S.getState()
    if (store.proxy.enabled) {
      google.options({ proxy: store.proxy.url })
    } else {
      google.options({ proxy: '' })
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
      this.ensureProxy()
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
      this.ensureProxy()
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
  * @param email: the email address to use
  * @param query: the query to ask the server for
  * @return promise
  */
  fetchEmailIds (auth, query) {
    if (!auth) { return this.rejectWithNoAuth() }

    return new Promise((resolve, reject) => {
      this.ensureProxy()
      gmail.users.messages.list({
        userId: 'me',
        q: query,
        auth: auth
      }, (err, response) => {
        if (err) {
          reject({ err: err })
        } else {
          // Do a pre-count for unread messages and threads
          resolve({
            response: response,
            unreadMessageCount: (response.messages || []).length,
            unreadThreadCount: (response.messages || []).reduce((acc, message) => {
              return acc.add(message.threadId)
            }, new Set()).size
          })
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
  fetchEmail (auth, messageId) {
    if (!auth) { return this.rejectWithNoAuth() }

    return new Promise((resolve, reject) => {
      this.ensureProxy()
      gmail.users.messages.get({
        userId: 'me',
        id: messageId,
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
