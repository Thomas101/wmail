const alt = require('../alt')
const constants = require('shared/constants')
const google = window.appNodeModulesRequire('googleapis')
const OAuth2 = google.auth.OAuth2
const credentials = require('shared/credentials')
const googleHTTP = require('./googleHTTP')
const mailboxStore = require('../mailbox/mailboxStore')
const mailboxActions = require('../mailbox/mailboxActions')
const {Mailbox, Google} = require('shared/Models/Mailbox')
const {ipcRenderer} = window.nativeRequire('electron')
const reporter = require('../../reporter')
const {mailboxDispatch} = require('../../Dispatch')

const cachedAuths = new Map()

class GoogleActions {

  /* **************************************************************************/
  // Pollers
  /* **************************************************************************/

  startPollingUpdates () {
    this.syncAllMailboxProfiles.defer()
    this.syncAllMailboxUnreadCounts.defer(true)

    return {
      profiles: setInterval(() => {
        this.syncAllMailboxProfiles()
      }, constants.GMAIL_PROFILE_SYNC_MS),

      unread: (() => {
        let partialCount = 0
        return setInterval(() => {
          if (partialCount >= 5) {
            this.syncAllMailboxUnreadCounts.defer(true)
            partialCount = 0
          } else {
            this.syncAllMailboxUnreadCounts.defer(false)
            partialCount++
          }
        }, constants.GMAIL_UNREAD_SYNC_MS)
      })()
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
    ipcRenderer.send('auth-google', { id: Mailbox.provisionId(), type: 'ginbox' })
    return { }
  }

  /**
  * Starts the auth process for gmail
  */
  authGmailMailbox () {
    ipcRenderer.send('auth-google', { id: Mailbox.provisionId(), type: 'gmail' })
    return { }
  }

  /**
  * Handles a mailbox authenticating
  * @param evt: the event that came over the ipc
  * @param data: the data that came across the ipc
  */
  authMailboxSuccess (evt, data) {
    mailboxActions.create(data.id, {
      type: data.type,
      googleAuth: data.auth
    })
    // Run the first sync
    const mailbox = mailboxStore.getState().getMailbox(data.id)
    const firstSync = Promise.all([
      this.syncMailboxProfile(data.id).promise,
      this.syncMailboxUnreadCount(data.id).promise
    ])

    return { mailbox: mailbox, firstSync: firstSync }
  }

  /**
  * Handles a mailbox authenticating error
  * @param evt: the ipc event that fired
  * @param data: the data that came across the ipc
  */
  authMailboxFailure (evt, data) {
    if (data.errorMessage.toLowerCase().indexOf('user') === 0) {
      return { user: true, data: null }
    } else {
      // Really log wha we're getting here to try and resolve issue #2
      console.error('[AUTH ERR]', data)
      console.error(data.errorString)
      console.error(data.errorStack)
      reporter.reportError('[AUTH ERR]' + data.errorString)
      return { data: data, user: false }
    }
  }

  /* **************************************************************************/
  // Profiles
  /* **************************************************************************/

  /**
  * Syncs all profiles
  */
  syncAllMailboxProfiles () {
    const mailboxIds = mailboxStore.getState().mailboxIds()
    if (mailboxIds.length === 0) { return { promise: Promise.resolve() } }

    const promise = Promise.all(mailboxIds.map((mailboxId) => {
      return this.syncMailboxProfile(mailboxId).promise
    })).then(
      () => { this.syncAllMailboxProfilesCompeted() },
      () => { this.syncAllMailboxProfilesCompeted() }
    )
    return { promise: promise }
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

    const promise = googleHTTP.fetchMailboxProfile(auth)
      .then((response) => {
        mailboxActions.setBasicProfileInfo(
          mailboxId,
          (response.response.emails.find((a) => a.type === 'account') || {}).value,
          response.response.displayName,
          response.response.image.url
        )
      })
      .then(
        (response) => this.syncMailboxProfileSuccess(mailboxId),
        (err) => this.syncMailboxProfileFailure(mailboxId, err)
      )

    return { mailboxId: mailboxId, promise: promise }
  }

  /**
  * Deals with a mailbox sync completing
  * @param mailboxId: the id of the mailbox
  */
  syncMailboxProfileSuccess (mailboxId) {
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
  * @param forceFullSync=false: set to true to avoid the cursory check
  */
  syncAllMailboxUnreadCounts (forceFullSync = false) {
    const mailboxIds = mailboxStore.getState().mailboxIds()
    if (mailboxIds.length === 0) { return { promise: Promise.resolve() } }

    const promise = Promise.all(mailboxIds.map((mailboxId) => {
      return this.syncMailboxUnreadCount(mailboxId, forceFullSync).promise
    })).then(
      () => { this.syncAllMailboxUnreadCountsCompleted() },
      () => { this.syncAllMailboxUnreadCountsCompleted() }
    )
    return { promise: promise }
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
  * @param forceFullSync=false: set to true to avoid the cursory check
  */
  syncMailboxUnreadCount (mailboxId, forceFullSync = false) {
    const { auth } = this.getAPIAuth(mailboxId)

    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    const label = mailbox.google.unreadLabel
    const unreadMode = mailbox.google.unreadMode

    const promise = Promise.resolve()
      .then(() => {
        // Step 1. Counts: Fetch the mailbox label
        return Promise.resolve()
          .then(() => {
            // Step 1.1: call out to google
            return googleHTTP.fetchMailboxLabel(auth, label)
          })
          .then(({ response }) => {
            // Step 1.2: Some mailbox types need to update the response by what's in the UI
            if (unreadMode === Google.UNREAD_MODES.PRIMARY_INBOX_UNREAD || unreadMode === Google.UNREAD_MODES.INBOX_UNREAD_IMPORTANT) {
              return Promise.resolve()
                .then(() => mailboxDispatch.fetchGmailUnreadCountWithRetry(mailboxId, forceFullSync ? 30 : 5))
                .then((count) => {
                  return Object.assign(response, {
                    threadsUnread: count || 0,
                    artificalThreadsUnread: true
                  })
                })
            } else {
              return response
            }
          })
          .then((response) => {
            // Step 1.3: Update the models. Decide if we changed
            const mailbox = mailboxStore.getState().getMailbox(mailboxId)
            mailboxActions.setGoogleLabelInfo(mailboxId, response)
            return Promise.resolve({
              changed: forceFullSync || mailbox.messagesTotal !== response.messagesTotal
            })
          })
      })
      .then(({changed}) => {
        // Step 2. Message info: if we did change run a query to get the unread message count
        if (!changed) { return Promise.resolve() }

        return Promise.resolve()
          .then(() => {
            // Step 2.1: Fetch the unread email ids
            const mailbox = mailboxStore.getState().getMailbox(mailboxId)
            const unreadQuery = mailbox.google.unreadQuery
            return googleHTTP.fetchThreadIds(auth, unreadQuery)
          })
          .then(({ response }) => {
            // Step 2.3: find the changed threads
            const threads = response.threads || []
            if (threads.length === 0) { return { threads: threads, changedThreads: [] } }

            const mailbox = mailboxStore.getState().getMailbox(mailboxId)
            const currentThreadsIndex = mailbox.google.latestUnreadThreads.reduce((acc, thread) => {
              acc[thread.id] = thread
              return acc
            }, {})
            const changedThreads = threads.reduce((acc, thread) => {
              if (!currentThreadsIndex[thread.id]) {
                acc.push(thread)
              } else if (currentThreadsIndex[thread.id].historyId !== thread.historyId) {
                acc.push(thread)
              } else if ((currentThreadsIndex[thread.id].messages || []).length === 0) {
                acc.push(thread)
              }
              return acc
            }, [])

            return { threads: threads, changedThreads: changedThreads }
          })
          .then(({ threads, changedThreads }) => {
            // Step 2.4: Grab the full threads
            if (changedThreads.length === 0) { return { threads: threads, changedThreads: [] } }

            return Promise.all(threads.map((thread) => {
              return Promise.resolve()
                .then(() => googleHTTP.fetchThread(auth, thread.id))
                .then(({response}) => response)
            }))
            .then((changedThreads) => {
              return { threads: threads, changedThreads: changedThreads }
            })
          })
          .then(({threads, changedThreads}) => {
            // Step 2.5: Store the grabbed threads
            if (changedThreads.length !== 0) {
              const changedIndexed = changedThreads.reduce((acc, thread) => {
                thread.messages = (thread.messages || []).map((message) => {
                  return {
                    id: message.id,
                    threadId: message.threadId,
                    historyId: message.historyId,
                    internalDate: message.internalDate,
                    snippet: message.snippet,
                    labelIds: message.labelIds,
                    payload: {
                      headers: message.payload.headers.filter((header) => {
                        return header.name === 'Subject' || header.name === 'From' || header.name === 'To'
                      })
                    }
                  }
                })
                acc[thread.id] = thread
                return acc
              }, {})

              mailboxActions.setGoogleLatestUnreadThreads(mailboxId, threads, changedIndexed)
              return { threads: threads, changedIndex: changedIndexed }
            } else {
              mailboxActions.setGoogleLatestUnreadThreads(mailboxId, threads, {})
              return { threads: threads, changedIndex: {} }
            }
          })
      })
      .then(
        () => this.syncMailboxUnreadCountSuccess(mailboxId),
        (err) => this.syncMailboxUnreadCountFailure(mailboxId, err)
      )

    return { mailboxId: mailboxId, promise: promise }
  }

  /**
  * Deals with a mailbox unread count completing
  * @param mailboxId: the id of the mailbox
  */
  syncMailboxUnreadCountSuccess (mailboxId) {
    return { mailboxId: mailboxId }
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
}

// Bind the IPC listeners
const actions = alt.createActions(GoogleActions)
ipcRenderer.on('auth-google-complete', actions.authMailboxSuccess)
ipcRenderer.on('auth-google-error', actions.authMailboxFailure)

module.exports = actions
