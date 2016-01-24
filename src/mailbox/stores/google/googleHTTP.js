const google = window.nativeRequire('googleapis')
const gPlus = google.plus('v1')
const gmail = google.gmail('v1')
const flux = {
  settings: require('../settings')
}

class GoogleHTTP {
  /**
  * @return the proxy information
  */
  proxyInformation () {
    const store = flux.settings.S.getState()
    if (store.getProxyServer().enabled) {
      return store.proxyServerUrl()
    } else {
      return undefined
    }
  }

  /**
  * Syncs a profile for a mailbox
  * @param mailbox: the mailbox to sync the profile for
  * @param auth: the auth to access google with
  * @return promise
  */
  syncProfile (mailbox, auth) {
    if (auth) {
      return new Promise((resolve, reject) => {
        gPlus.people.get({
          userId: 'me',
          auth: auth,
          proxy: this.proxyInformation()
        }, (err, response) => {
          if (err) {
            reject({ mailboxId: mailbox.id, err: err })
          } else {
            resolve({ mailboxId: mailbox.id, response: response })
          }
        })
      })
    } else {
      return Promise.reject({
        mailboxId: mailbox.id,
        err: 'Local - Mailbox missing authentication information'
      })
    }
  }

  /**
  * Syncs the unread for an account
  * @param mailbox: the mailbox to sync the profile for
  * @param auth: the auth to access google with
  * @return promise
  */
  syncUnread (mailbox, auth) {
    if (!auth) {
      return Promise.reject({
        mailboxId: mailbox.id,
        err: 'Local - Mailbox missing authentication information'
      })
    } else if (!mailbox.email) {
      return Promise.reject({
        mailboxId: mailbox.id,
        err: 'Local - Mailbox has no email address'
      })
    } else {
      return new Promise((resolve, reject) => {
        gmail.users.threads.list({
          userId: mailbox.email,
          q: 'label:inbox label:unread',
          auth: auth,
          proxy: this.proxyInformation()
        }, (err, response) => {
          if (err) {
            reject({ mailboxId: mailbox.id, err: err })
          } else {
            resolve({ mailboxId: mailbox.id, response: response })
          }
        })
      })
    }
  }
}

module.exports = new GoogleHTTP()
