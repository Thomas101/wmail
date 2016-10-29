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
  * @param query: the query to ask the server for
  * @param limit=10: the limit on results to fetch
  * @return promise
  */
  fetchThreadIds (auth, query, limit = 25) {
    if (!auth) { return this.rejectWithNoAuth() }

    return new Promise((resolve, reject) => {
      this.ensureProxy()
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
      this.ensureProxy()
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
