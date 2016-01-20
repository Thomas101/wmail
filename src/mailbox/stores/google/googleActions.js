const alt = require('../alt')
const constants = require('shared/constants')
const google = window.ndnativeRequire('googleapis')
const OAuth2 = google.auth.OAuth2
const credentials = require('shared/credentials')
const googleHTTP = require('./googleHTTP')
const mailboxStore = require('../mailbox/mailboxStore')
const mailboxActions = require('../mailbox/mailboxActions')
const Mailbox = require('../mailbox/Mailbox')
const ipc = window.nativeRequire('electron').ipcRenderer

// This is bad. We shouldn't be storing state in actions
const cachedAuths = new Map()

class GoogleActions {
  /* **************************************************************************/
  // Auth
  /* **************************************************************************/

  /**
  * Sets up the auth for a mailbox
  */
  setupAuth (mailbox) {
    let generate = false
    if (cachedAuths.has(mailbox.id)) {
      if (cachedAuths.get(mailbox.id).time !== mailbox.googleAuthTime) {
        generate = true
      }
    } else {
      generate = true
    }

    if (generate && mailbox.hasGoogleAuth) {
      const auth = new OAuth2(credentials.GOOGLE_CLIENT_ID, credentials.GOOGLE_CLIENT_SECRET)
      auth.setCredentials({
        access_token: mailbox.googleAccessToken,
        refresh_token: mailbox.googleRefreshToken,
        expiry_date: mailbox.googleAuthExpiryTime
      })
      cachedAuths.set(mailbox.id, {
        time: mailbox.googleAuthTime,
        auth: auth
      })

      return { mailboxId: mailbox.id, auth: cachedAuths.get(mailbox.id) }
    } else {
      return {}
    }
  }

  /* **************************************************************************/
  // Pollers
  /* **************************************************************************/

  /**
  * Starts polling google with sync events
  */
  startPollSync () {
    return {
      profiles: setInterval(() => {
        this.syncAllProfiles()
      }, constants.GMAIL_PROFILE_SYNC_MS),

      unread: setInterval(() => {
        this.syncAllUnreadCounts()
      }, constants.GMAIL_UNREAD_SYNC_MS)
    }
  }

  /**
  * Stops polling google with sync events
  */
  stopPollSync () { return {} }

  /* **************************************************************************/
  // Sync
  /* **************************************************************************/

  /**
  * Syncs a mailbox by grabbing the profile then unread count
  * @param mailbox: the mailbox to sync
  * @return promise
  */
  syncMailbox (mailbox) {
    const promise = Promise.resolve()
      .then(() => this.syncProfiles([mailbox]).promise)
      .then(() => Promise.resolve(mailboxStore.getState().get(mailbox.id))) // we have to refetch the mailbox because it will have been updated
      .then((mailbox) => this.syncUnreadCounts([mailbox]).promise)
    return { promise: promise }
  }

  /* **************************************************************************/
  // Profile Sync
  /* **************************************************************************/

  /**
  * Syncs all profiles
  */
  syncAllProfiles () {
    this.syncProfiles(mailboxStore.getState().all())
    return {}
  }

  /**
  * Syncs the profiles for a set of mailboxes
  * @param mailboxes: the mailboxes to sync
  */
  syncProfiles (mailboxes) {
    if (mailboxes.length) {
      const requests = mailboxes.map(mailbox => {
        this.setupAuth(mailbox)
        return googleHTTP.syncProfile(mailbox, (cachedAuths.get(mailbox.id) || {}).auth)
      })

      const promise = Promise.all(requests).then(
        (responses) => { this.syncProfilesComplete(responses) },
        (err) => { console.warn('[SYNC ERR]', err) }
      )
      return { promise: promise }
    } else {
      return { promise: Promise.resolve() }
    }
  }

  /**
  * Handles profile sync completing
  * @param responses: the array of responses
  */
  syncProfilesComplete (responses) {
    responses.forEach(response => {
      if (response.response) {
        mailboxActions.update(response.mailboxId, {
          avatar: response.response.image.url,
          email: (response.response.emails.find(a => a.type === 'account') || {}).value,
          name: response.response.displayName
        })
      }
    })

    return { responses: responses }
  }

  /* **************************************************************************/
  // Unread Sync
  /* **************************************************************************/

  /**
  * Syncs all profiles
  */
  syncAllUnreadCounts () {
    this.syncUnreadCounts(mailboxStore.getState().all())
    return {}
  }

  /**
  * Syncs the unread count for a set of mailboxes
  * @param mailboxes: the mailboxes to sync the count for
  */
  syncUnreadCounts (mailboxes) {
    if (mailboxes.length) {
      const requests = mailboxes.map(mailbox => {
        this.setupAuth(mailbox)
        return googleHTTP.syncUnread(mailbox, (cachedAuths.get(mailbox.id) || {}).auth)
      })

      const promise = Promise.all(requests).then(
        (responses) => { this.syncUnreadCountsComplete(responses) },
        (err) => { console.warn('[SYNC ERR]', err) }
      )
      return { promise: promise }
    } else {
      return { promise: Promise.resolve() }
    }
  }

  /**
  * Handles unread sync completing
  * @param responses: the array of responses
  */
  syncUnreadCountsComplete (responses) {
    responses.forEach(response => {
      if (response.response) {
        mailboxActions.update(response.mailboxId, {
          unread: response.response.resultSizeEstimate
        })
      }
    })
    return { responses: responses }
  }

  /* **************************************************************************/
  // Authentication
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

    const mailbox = mailboxStore.getState().get(data.id)
    const firstSync = this.syncMailbox(mailbox)
    return { mailbox: mailbox, firstSync: firstSync }
  }

  /**
  * Handles a mailbox authenticating error
  * @param data: the data that came across the ipc
  */
  authMailboxFailure (data) {
    console.error('[AUTH ERROR]', data)
    return { data: data }
  }
}

module.exports = alt.createActions(GoogleActions)
