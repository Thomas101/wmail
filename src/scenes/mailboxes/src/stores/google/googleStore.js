const alt = require('../alt')
const actions = require('./googleActions')
const { mailboxStore, mailboxActions } = require('../mailbox')
const googleHTTP = require('./googleHTTP')
const { mailboxDispatch } = require('../../Dispatch')
const constants = require('shared/constants')

class GoogleStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.cachedAuths = new Map()
    this.profileSync = null
    this.unreadSync = null

    this.openProfileRequests = new Map()
    this.openUnreadCountRequests = new Map()

    /* **************************************/
    // Request checkers
    /* **************************************/

    this.hasOpenProfileRequest = (mailboxId) => {
      return (this.openProfileRequests.get(mailboxId) || 0) >= 1
    }

    this.hasOpenUnreadCountRequest = (mailboxId) => {
      return (this.openUnreadCountRequests.get(mailboxId) || 0) >= 1
    }

    /* **************************************/
    // Listeners
    /* **************************************/

    this.bindListeners({
      handleStartPollSync: actions.START_POLLING_UPDATES,
      handleStopPollSync: actions.STOP_POLLING_UPDATES,

      handleSyncMailboxProfile: actions.SYNC_MAILBOX_PROFILE,
      handleSyncMailboxProfileSuccess: actions.SYNC_MAILBOX_PROFILE_SUCCESS,
      handleSyncMailboxProfileFailure: actions.SYNC_MAILBOX_PROFILE_FAILURE,

      handleSyncMailboxUnreadCount: actions.SYNC_MAILBOX_UNREAD_COUNT,
      handleSuggestSyncMailboxUnreadCount: actions.SUGGEST_SYNC_MAILBOX_UNREAD_COUNT,
      handleSyncMailboxUnreadCountSuccess: actions.SYNC_MAILBOX_UNREAD_COUNT_SUCCESS,
      handleSyncMailboxUnreadCountFailure: actions.SYNC_MAILBOX_UNREAD_COUNT_FAILURE
    })
  }

  /* **************************************************************************/
  // Utils
  /* **************************************************************************/

  /**
  * Sets up the auth for a mailbox
  * @param mailboxId: the id of the mailbox to setup for
  * @return { auth } the mailbox auth and the mailbox id
  */
  getAPIAuth (mailboxId) {
    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    if (!mailbox) {
      return { auth: undefined }
    } else {
      return { auth: googleHTTP.generateAuth(mailbox.google.accessToken, mailbox.google.refreshToken, mailbox.google.authExpiryTime) }
    }
  }

  /* **************************************************************************/
  // Error Detection
  /* **************************************************************************/

  /**
  * Checks if an error is an invalid grant error
  * @param err: the error that was thrown
  * @return true if this error is invalid grant
  */
  isInvalidGrantError (err) {
    if (err && typeof (err.message) === 'string') {
      if (err.message.indexOf('invalid_grant') !== -1 || err.message.indexOf('Invalid Credentials') !== -1) {
        return true
      }
    }
    return false
  }

  /* **************************************************************************/
  // Handlers: Pollers
  /* **************************************************************************/

  /**
  * Saves the intervals so they can be cancelled later
  * @profiles: the profiles interval
  * @param unread: the unread interval
  * @param notification: the notification interval
  */
  handleStartPollSync ({profiles, unread, notification}) {
    clearInterval(this.profileSync)
    this.profileSync = setInterval(() => {
      actions.syncAllMailboxProfiles()
    }, constants.GMAIL_PROFILE_SYNC_MS)

    clearInterval(this.unreadSync)
    this.unreadSync = (() => {
      let partialCount = 0
      return setInterval(() => {
        if (partialCount >= 5) {
          actions.syncAllMailboxUnreadCounts(true)
          partialCount = 0
        } else {
          actions.syncAllMailboxUnreadCounts(false)
          partialCount++
        }
      }, constants.GMAIL_UNREAD_SYNC_MS)
    })()

    actions.syncAllMailboxProfiles.defer()
    actions.syncAllMailboxUnreadCounts.defer(true)
  }

  /**
  * Stops any running intervals
  */
  handleStopPollSync () {
    clearInterval(this.profileSync)
    this.profileSync = null
    clearInterval(this.unreadSync)
    this.unreadSync = null
  }

  /* **************************************************************************/
  // Handlers: Profiles
  /* **************************************************************************/

  handleSyncMailboxProfile ({ mailboxId }) {
    this.openProfileRequests.set((this.openProfileRequests.get(mailboxId) || 0) + 1)

    const { auth } = this.getAPIAuth(mailboxId)
    googleHTTP.fetchMailboxProfile(auth)
      .then((response) => {
        mailboxActions.setBasicProfileInfo(
          mailboxId,
          (response.response.emails.find((a) => a.type === 'account') || {}).value,
          response.response.displayName,
          response.response.image.url
        )
      })
      .then(
        (response) => actions.syncMailboxProfileSuccess(mailboxId),
        (err) => actions.syncMailboxProfileFailure(mailboxId, err)
      )
  }

  handleSyncMailboxProfileSuccess ({ mailboxId }) {
    this.openProfileRequests.set(this.openProfileRequests.get(mailboxId) - 1)
    mailboxActions.setGoogleHasGrantError.defer(mailboxId, false)
  }

  handleSyncMailboxProfileFailure ({ mailboxId, err }) {
    if (this.isInvalidGrantError(err.err)) {
      mailboxActions.setGoogleHasGrantError.defer(mailboxId, true)
    } else {
      console.warn('[SYNC ERR] Mailbox Profile', err)
    }
    this.openProfileRequests.set(this.openProfileRequests.get(mailboxId) - 1)
  }

  /* **************************************************************************/
  // Handlers: Unread Counts
  /* **************************************************************************/

  handleSyncMailboxUnreadCount ({ mailboxId, forceFullSync }) {
    this.openUnreadCountRequests.set((this.openUnreadCountRequests.get(mailboxId) || 0) + 1)
    const { auth } = this.getAPIAuth(mailboxId)

    const mailbox = mailboxStore.getState().getMailbox(mailboxId)
    const label = mailbox.google.unreadLabel

    Promise.resolve()
      .then(() => {
        // Step 1. Counts: Fetch the mailbox label
        return Promise.resolve()
          .then(() => {
            // Step 1.1: call out to google
            return googleHTTP.fetchMailboxLabel(auth, label)
          })
          .then(({ response }) => {
            const mailbox = mailboxStore.getState().getMailbox(mailboxId)

            // Step 1.2. see if we are configured to grab the unread count from the ui
            if (mailbox.google.takeLabelCountFromUI) {
              return Promise.resolve()
                .then(() => mailboxDispatch.fetchGmailUnreadCountWithRetry(mailboxId, forceFullSync ? 30 : 5))
                .then(({count, available}) => {
                  if (available) {
                    return Object.assign(response, {
                      unreadCountFromUI: true,
                      threadsUnread: count
                    })
                  } else {
                    const passResponse = Object.assign(response, {
                      unreadCountFromUI: true
                    })
                    delete passResponse.threadsUnread
                    return passResponse
                  }
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
              changed: forceFullSync || mailbox.google.messagesTotal !== response.messagesTotal
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

            if (threads.length === 0) { return { threads: threads, changedThreads: [], resultSizeEstimate: response.resultSizeEstimate } }

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

            return { threads: threads, changedThreads: changedThreads, resultSizeEstimate: response.resultSizeEstimate }
          })
          .then(({ threads, changedThreads, resultSizeEstimate }) => {
            // Step 2.4: Grab the full threads
            if (changedThreads.length === 0) { return { threads: threads, changedThreads: [], resultSizeEstimate: resultSizeEstimate } }

            return Promise.all(threads.map((thread) => {
              return Promise.resolve()
                .then(() => googleHTTP.fetchThread(auth, thread.id))
                .then(({response}) => response)
            }))
            .then((changedThreads) => {
              return { threads: threads, changedThreads: changedThreads, resultSizeEstimate: resultSizeEstimate }
            })
          })
          .then(({threads, changedThreads, resultSizeEstimate}) => {
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
                        const name = header.name.toLowerCase()
                        return name === 'subject' || name === 'from' || name === 'to'
                      })
                    }
                  }
                })
                acc[thread.id] = thread
                return acc
              }, {})

              mailboxActions.setGoogleLatestUnreadThreads(mailboxId, threads, resultSizeEstimate, changedIndexed)
              return { threads: threads, changedIndex: changedIndexed }
            } else {
              mailboxActions.setGoogleLatestUnreadThreads(mailboxId, threads, resultSizeEstimate, {})
              return { threads: threads, changedIndex: {} }
            }
          })
      })
      .then(
        () => actions.syncMailboxUnreadCountSuccess(mailboxId),
        (err) => actions.syncMailboxUnreadCountFailure(mailboxId, err)
      )
  }

  handleSuggestSyncMailboxUnreadCount ({ mailboxId }) {
    if (!this.hasOpenUnreadCountRequest(mailboxId)) {
      actions.syncMailboxUnreadCount.defer(mailboxId)
    }
  }

  handleSyncMailboxUnreadCountSuccess ({ mailboxId }) {
    this.openUnreadCountRequests.set(this.openUnreadCountRequests.get(mailboxId) - 1)
    mailboxActions.setGoogleHasGrantError.defer(mailboxId, false)
  }

  handleSyncMailboxUnreadCountFailure ({ mailboxId, err }) {
    this.openUnreadCountRequests.set(this.openUnreadCountRequests.get(mailboxId) - 1)
    if (this.isInvalidGrantError(err.err)) {
      mailboxActions.setGoogleHasGrantError.defer(mailboxId, true)
    } else {
      console.warn('[SYNC ERR] Mailbox Unread Count', err)
    }
  }
}

module.exports = alt.createStore(GoogleStore, 'GoogleStore')
