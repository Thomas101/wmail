const alt = require('../alt')
const constants = require('shared/constants')
const google = window.appNodeModulesRequire('googleapis')
const OAuth2 = google.auth.OAuth2
const credentials = require('shared/credentials')
const googleHTTP = require('./googleHTTP')
const mailboxStore = require('../mailbox/mailboxStore')
const mailboxActions = require('../mailbox/mailboxActions')
const settingsStore = require('../settings/settingsStore')
const Mailbox = require('shared/Models/Mailbox/Mailbox')
const ipc = window.nativeRequire('electron').ipcRenderer
const reporter = require('../../reporter')

const cachedAuths = new Map()

class GoogleActions {

  /* **************************************************************************/
  // Pollers
  /* **************************************************************************/

  startPollingUpdates () {
    return {
      profiles: setInterval(() => {
        this.syncAllMailboxProfiles()
      }, constants.GMAIL_PROFILE_SYNC_MS),

      unread: setInterval(() => {
        this.syncAllMailboxUnreadCounts()
      }, constants.GMAIL_UNREAD_SYNC_MS),

      notification: setInterval(() => {
        this.syncAllMailboxUnreadMessages()
      }, constants.GMAIL_NOTIFICATION_SYNC_MS)
    }
  }

  stopPollingUpdates () {
    return {}
  }

  /* **************************************************************************/
  // API Auth
  /* **************************************************************************/

  /**
  * Sets up the auth for a mailbox
  * @param mailboxId: the id of the mailbox to setup for
  * @return { auth, mailboxId } the mailbox auth and the mailbox id
  */
  getAPIAuth (mailboxId) {
    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    let generate = false
    if (cachedAuths.has(mailboxId)) {
      if (cachedAuths.get(mailboxId).time !== mailbox.google.authTime) {
        generate = true
      }
    } else {
      generate = true
    }

    if (generate && mailbox.google.hasAuth) {
      const auth = new OAuth2(credentials.GOOGLE_CLIENT_ID, credentials.GOOGLE_CLIENT_SECRET)
      auth.setCredentials({
        access_token: mailbox.google.accessToken,
        refresh_token: mailbox.google.refreshToken,
        expiry_date: mailbox.google.authExpiryTime
      })
      cachedAuths.set(mailbox.id, {
        time: mailbox.google.authTime,
        auth: auth
      })
    }

    return cachedAuths.get(mailboxId)
  }

  /* **************************************************************************/
  // User Auth
  /* **************************************************************************/

  /**
  * Starts the auth process for google inbox
  */
  authInboxMailbox () {
    ipc.send('auth-google', { id: Mailbox.provisionId(), type: 'ginbox' })
    return { }
  }

  /**
  * Starts the auth process for gmail
  */
  authGmailMailbox () {
    ipc.send('auth-google', { id: Mailbox.provisionId(), type: 'gmail' })
    return { }
  }

  /**
  * Handles a mailbox authenticating
  * @param data: the data that came across the ipc
  */
  authMailboxSuccess (data) {
    mailboxActions.create(data.id, {
      type: data.type,
      googleAuth: data.auth
    })
    // Run the first sync
    const mailbox = mailboxStore.getState().getMailbox(data.id)
    const firstSync = this.syncMailbox(data.id)
    return { mailbox: mailbox, firstSync: firstSync }
  }

  /**
  * Handles a mailbox authenticating error
  * @param data: the data that came across the ipc
  */
  authMailboxFailure (data) {
    // Really log wha we're getting here to try and resolve issue #2
    console.error('[AUTH ERR]', data)
    console.error(data.errorString)
    console.error(data.errorStack)
    reporter.reportError('[AUTH ERR]' + data.errorString)
    return { data: data }
  }

  /* **************************************************************************/
  // Mailbox
  /* **************************************************************************/

  /**
  * Syncs all mailboxes
  */
  syncAllMailboxes () {
    const mailboxIds = mailboxStore.getState().mailboxIds()
    if (mailboxIds.length === 0) { return { promises: Promise.resolve() } }

    const promises = mailboxIds.map((mailboxId) => {
      return this.syncMailbox(mailboxId).promise
    })

    Promise.all(promises).then(
      () => { this.syncAllMailboxesCompeted() },
      (e) => { this.syncAllMailboxesCompeted() })
    return { promises: promises }
  }

  /**
  * Indicates that all profiles have been synced
  */
  syncAllMailboxesCompeted () {
    return {}
  }

  /**
  * Syncs all aspects of a mailbox
  * @param mailboxId: the id of the mailbox to sync
  */
  syncMailbox (mailboxId) {
    const promise = Promise.resolve()
      .then(() => this.syncMailboxProfile(mailboxId).promise)
      .then(() => this.syncMailboxUnreadCount(mailboxId).promise)
      .then(
        () => { this.syncMailboxSuccess(mailboxId) },
        (err) => { this.syncMailboxFailure(mailboxId, err) })
    return { promise: promise }
  }

  /**
  * Indicates the mailbox synced successfully
  * @param mailboxId: the id of the mailbox that synced
  */
  syncMailboxSuccess (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /**
  * Indicates the mailbox synced successfully
  * @param mailboxId: the id of the mailbox that synced
  * @param err: the error that occured
  */
  syncMailboxFailure (mailboxId, err) {
    return { mailboxId: mailboxId, err: err }
  }

  /* **************************************************************************/
  // Profiles
  /* **************************************************************************/

  /**
  * Syncs all profiles
  */
  syncAllMailboxProfiles () {
    const mailboxIds = mailboxStore.getState().mailboxIds()
    if (mailboxIds.length === 0) { return { promises: Promise.resolve() } }

    const promises = mailboxIds.map((mailboxId) => {
      return this.syncMailboxProfile(mailboxId).promise
    })

    Promise.all(promises).then(
      () => { this.syncAllMailboxProfilesCompeted() },
      () => { this.syncAllMailboxProfilesCompeted() })
    return { promises: promises }
  }

  /**
  * Indicates that all profiles have been synced
  */
  syncAllMailboxProfilesCompeted () {
    return {}
  }

  /**
  * Syncs a mailbox profile
  * @param mailboxId: the id of the mailbox
  */
  syncMailboxProfile (mailboxId) {
    const { auth } = this.getAPIAuth(mailboxId)

    const promise = googleHTTP.fetchMailboxProfile(auth).then((response) => {
      this.syncMailboxProfileSuccess(mailboxId, response)
    }, (err) => {
      this.syncMailboxProfileFailure(mailboxId, err)
    })

    return { mailboxId: mailboxId, promise: promise }
  }

  /**
  * Deals with a mailbox sync completing
  * @param mailboxId: the id of the mailbox
  * @param response: the response from the api
  */
  syncMailboxProfileSuccess (mailboxId, response) {
    mailboxActions.update(mailboxId, {
      avatar: response.response.image.url,
      email: (response.response.emails.find((a) => a.type === 'account') || {}).value,
      name: response.response.displayName
    })
    return { mailboxId: mailboxId }
  }

  /**
  * Deals with a mailbox sync completing
  * @param mailboxId: the id of the mailbox
  * @param err: the error from the api
  */
  syncMailboxProfileFailure (mailboxId, err) {
    console.warn('[SYNC ERR] Mailbox Profile', err)
    return { mailboxId: mailboxId }
  }

  /* **************************************************************************/
  // Unread Counts
  /* **************************************************************************/

  /**
  * Syncs all profiles
  */
  syncAllMailboxUnreadCounts () {
    const mailboxIds = mailboxStore.getState().mailboxIds()
    if (mailboxIds.length === 0) { return { promises: Promise.resolve() } }

    const promises = mailboxIds.map((mailboxId) => {
      return this.syncMailboxUnreadCount(mailboxId).promise
    })

    Promise.all(promises).then(
      () => { this.syncAllMailboxUnreadCountsCompleted() },
      () => { this.syncAllMailboxUnreadCountsCompleted() })
    return { promises: promises }
  }

  /**
  * Indicates that all profiles have been synced
  */
  syncAllMailboxUnreadCountsCompleted () {
    return {}
  }

  /**
  * Syncs the unread count for a set of mailboxes
  * @param mailboxId: the id of the mailbox
  */
  syncMailboxUnreadCount (mailboxId) {
    const { auth } = this.getAPIAuth(mailboxId)
    const mailbox = mailboxStore.getState().getMailbox(mailboxId)

    const label = mailbox.google.unreadLabel
    const labelField = mailbox.google.unreadLabelField
    const promise = googleHTTP.fetchMailboxLabel(auth, mailbox.email, label).then((response) => {
      this.syncMailboxUnreadCountSuccess(mailboxId, response, label, labelField)
    }, (err) => {
      this.syncMailboxUnreadCountFailure(mailboxId, err)
    })

    return { mailboxId: mailboxId, promise: promise }
  }

  /**
  * Deals with a mailbox unread count completing
  * @param mailboxId: the id of the mailbox
  * @param response: the response from the api
  * @param label: the label that was searched
  * @param labelField: the name of the field that should have the value taken from it
  */
  syncMailboxUnreadCountSuccess (mailboxId, response, label, labelField) {
    const prevMailbox = mailboxStore.getState().getMailbox(mailboxId)
    // Look to see if the unread count has changed. If it has, update it
    // then ask to sync the messages to provide info to the user in a timely fasion
    if (prevMailbox && prevMailbox.unread !== response.response[labelField]) {
      mailboxActions.update(mailboxId, {
        unread: response.response[labelField]
      })
      this.syncMailboxUnreadMessages(mailboxId)
      return { mailboxId: mailboxId, changed: true }
    } else {
      return { mailboxId: mailboxId, changed: false }
    }
  }

  /**
  * Deals with a mailbox unread count erroring
  * @param mailboxId: the id of the mailbox
  * @param err: the error from the api
  */
  syncMailboxUnreadCountFailure (mailboxId, err) {
    console.warn('[SYNC ERR] Mailbox Unread Count', err)
    return { mailboxId: mailboxId }
  }

  /* **************************************************************************/
  // Unread Messages
  /* **************************************************************************/

  /**
  * Syncs all unread messages
  */
  syncAllMailboxUnreadMessages () {
    const mailboxIds = mailboxStore.getState().mailboxIds()
    if (mailboxIds.length === 0) { return { promises: Promise.resolve() } }

    const promises = mailboxIds.map((mailboxId) => {
      return this.syncMailboxUnreadMessages(mailboxId).promise
    })

    Promise.all(promises).then(
      () => { this.syncAllMailboxUnreadMessagesCompleted() },
      () => { this.syncAllMailboxUnreadMessagesCompleted() })
    return { promises: promises }
  }

  /**
  * Indicates that all unread messages have been synced
  */
  syncAllMailboxUnreadMessagesCompleted () {
    return {}
  }

  /**
  * Syncs the unread messages for a mailbox
  * @param mailboxId: the id of the mailbox
  */
  syncMailboxUnreadMessages (mailboxId) {
    // Check not disabled globally
    if (settingsStore.getState().os.notificationsEnabled === false) {
      this.syncMailboxUnreadMessagesSuccess(mailboxId)
      return { mailboxId: mailboxId, promise: Promise.resolve() }
    }

    // Check not distabled for inbox / no unread messages
    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    if (mailbox.unread === 0 || !mailbox.showNotifications) {
      this.syncMailboxUnreadMessagesSuccess(mailboxId)
      return { mailboxId: mailboxId, promise: Promise.resolve() }
    }

    // Start making calls to google
    const { auth } = this.getAPIAuth(mailboxId)
    const promise = Promise.resolve()
      .then(() => googleHTTP.fetchEmailSummaries(auth, mailbox.email, mailbox.google.unreadQuery))
      .then((response) => {
        const mailbox = mailboxStore.getState().getMailbox(mailboxId)

        // Mark the latest set of unread messages
        const allMessageIds = (response.response.messages || []).map((data) => data.id)
        const messageIds = (response.response.messages || []).reduce((acc, data) => {
          // Look to see if we've seen this message already
          // Also look to see if this is one of multiple in a thread
          if (acc.threads[data.threadId]) {
            acc.autoread.push(data.id)
          } else {
            if (mailbox.google.unreadMessages[data.id]) {
              acc.seen.push(data.id)
            } else {
              acc.unseen.push(data.id)
            }
            acc.threads[data.threadId] = true
          }
          return acc
        }, { seen: [], unseen: [], threads: {}, autoread: [] })

        // Report that we've seen previously known messages
        mailboxActions.setGoogleUnreadMessageIds(mailboxId, allMessageIds)

        // Mark auto-read thread items as seen and reported
        mailboxActions.setGoogleUnreadNotificationsShown(mailboxId, messageIds.autoread)

        return Promise.resolve(messageIds.unseen)
      })
      .then((messageIds) => {
        if (!messageIds || messageIds.length === 0) { return Promise.resolve([]) }

        const { auth } = this.getAPIAuth(mailboxId)
        const mailbox = mailboxStore.getState().getMailbox(mailboxId)
        return Promise.all(messageIds.map((messageId) => {
          return googleHTTP.fetchEmail(auth, mailbox.email, messageId).then(
            (response) => Promise.resolve({ messageId: messageId, response: response }),
            (error) => Promise.reject({ messageId: messageId, error: error })
          )
        }))
      })
      .then((items) => {
        if (items.length === 0) { return Promise.resolve() }

        items.forEach((item) => {
          mailboxActions.updateGoogleUnread(mailboxId, item.messageId, { message: item.response.response })
        })

        return Promise.resolve()
      })
      .then(() => {
        this.syncMailboxUnreadMessagesSuccess(mailboxId)
        return Promise.resolve()
      }, (error) => {
        this.syncMailboxUnreadMessagesFailure(mailboxId, error)
        return Promise.reject()
      })

    return { mailboxId: mailboxId, promise: promise }
  }

  /**
  * Deals with a mailbox unread messages completing
  * @param mailboxId: the id of the mailbox
  */
  syncMailboxUnreadMessagesSuccess (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /**
  * Deals with a mailbox unread messages erroring
  * @param mailboxId: the id of the mailbox
  * @param err: the error from the api
  */
  syncMailboxUnreadMessagesFailure (mailboxId, err) {
    console.warn('[SYNC ERR] Mailbox Unread Messages', err)
    return { mailboxId: mailboxId }
  }

}

module.exports = alt.createActions(GoogleActions)
