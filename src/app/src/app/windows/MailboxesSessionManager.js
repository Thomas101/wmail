const electron = require('electron')
const uuid = require('uuid')
const fs = require('fs-extra')
const path = require('path')
const settingStore = require('../stores/settingStore')
const mailboxStore = require('../stores/mailboxStore')

const COOKIE_PERSIST_PERIOD = 1000 * 30 // 30 secs

class MailboxesSessionManager {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param mailboxWindow: the mailbox window instance we're working for
  */
  constructor (mailboxWindow) {
    this.mailboxWindow = mailboxWindow
    this.downloadsInProgress = { }
    this.persistCookieThrottle = { }

    this.__managed__ = new Set()
  }

  /* ****************************************************************************/
  // Utils
  /* ****************************************************************************/

  /**
  * @param partition: the partition id
  * @return the mailbox model for the partition
  */
  getMailboxFromPartition (partition) {
    return mailboxStore.getMailbox(partition.replace('persist:', ''))
  }

  /* ****************************************************************************/
  // Setup
  /* ****************************************************************************/

  /**
  * Starts managing a session
  * @param parition the name of the partion to manage
  */
  startManagingSession (partition) {
    if (this.__managed__.has(partition)) { return }

    const ses = electron.session.fromPartition(partition)
    ses.setDownloadPath(electron.app.getPath('downloads'))
    ses.on('will-download', (evt, item) => this.handleDownload(evt, item))
    ses.setPermissionRequestHandler(this.handlePermissionRequest)
    ses.webRequest.onCompleted((evt) => this.handleRequestCompleted(evt, ses, partition))

    this.__managed__.add(partition)
  }

  /* ****************************************************************************/
  // Permissions
  /* ****************************************************************************/

  /**
  * Handles a request for a permission from the client
  * @param webContents: the webcontents the request came from
  * @param permission: the permission name
  * @param callback: execute with response
  */
  handlePermissionRequest (webContents, permission, callback) {
    if (permission === 'notifications') {
      callback(false)
    } else {
      callback(true)
    }
  }

  /* ****************************************************************************/
  // Downloads
  /* ****************************************************************************/

  handleDownload (evt, item) {
    // If the user has chosen - auto save the item
    if (!settingStore.os.alwaysAskDownloadLocation && settingStore.os.defaultDownloadLocation) {
      const folderLocation = settingStore.os.defaultDownloadLocation
      const fpath = path.parse(item.getFilename() || 'untitled')

      // Check the file exists
      fs.ensureDirSync(folderLocation)

      // Keep trying a different variation of the filename until we find one that isn't in use
      let iter = 0
      while (true) {
        const testName = fpath.name + (iter === 0 ? '' : ' (' + iter + ')') + fpath.ext
        const testPath = path.join(folderLocation, testName)

        let exists
        try {
          fs.statSync(testPath)
          exists = true
        } catch (ex) {
          exists = false
        }

        if (exists) {
          iter++
        } else {
          item.setSavePath(testPath)
          break
        }
      }
    }

    // Report the progress to the window to display it
    const totalBytes = item.getTotalBytes()
    const id = uuid.v4()
    item.on('updated', () => {
      this.updateDownloadProgress(id, item.getReceivedBytes(), totalBytes)
    })
    item.on('done', (e, state) => {
      this.downloadFinished(id)
      if (state === 'completed') {
        const savePath = item.getSavePath()
        const saveName = path.basename(savePath)
        this.mailboxWindow.downloadCompleted(savePath, saveName)
      }
    })
  }

  /* ****************************************************************************/
  // Download Progress
  /* ****************************************************************************/

  /**
  * Updates the progress bar in the dock
  */
  updateWindowProgressBar () {
    const all = Object.keys(this.downloadsInProgress).reduce((acc, id) => {
      acc.received += this.downloadsInProgress[id].received
      acc.total += this.downloadsInProgress[id].total
      return acc
    }, { received: 0, total: 0 })

    if (all.received === 0 && all.total === 0) {
      this.mailboxWindow.setProgressBar(-1)
    } else {
      this.mailboxWindow.setProgressBar(all.received / all.total)
    }
  }

  /**
  * Updates the progress on a download
  * @param id: the download id
  * @param received: the bytes received
  * @param total: the total bytes to download
  */
  updateDownloadProgress (id, received, total) {
    this.downloadsInProgress[id] = this.downloadsInProgress[id] || {}
    this.downloadsInProgress[id].received = received
    this.downloadsInProgress[id].total = total
    this.updateWindowProgressBar()
  }

  /**
  * Indicates that a download has finished
  * @param id: the download id
  */
  downloadFinished (id) {
    delete this.downloadsInProgress[id]
    this.updateWindowProgressBar()
  }

  /* ****************************************************************************/
  // Requests
  /* ****************************************************************************/

  /**
  * Handles a request completing
  * @param evt: the event that fired
  * @param session: the session this request was for
  * @param partition: the partition string for this session
  */
  handleRequestCompleted (evt, session, partition) {
    this.artificiallyPersistCookies(session, partition)
  }

  /* ****************************************************************************/
  // Cookies
  /* ****************************************************************************/

  /**
  * Forces the cookies to persist artifically. This helps users using saml signin
  * @param session: the session this request was for
  * @param partition: the partition string for this session
  */
  artificiallyPersistCookies (session, partition) {
    if (this.persistCookieThrottle[partition] !== undefined) { return }
    const mailbox = this.getMailboxFromPartition(partition)
    if (!mailbox || !mailbox.artificiallyPersistCookies) { return }

    this.persistCookieThrottle[partition] = setTimeout(() => {
      session.cookies.get({ session: true }, (error, cookies) => {
        if (error || !cookies.length) {
          delete this.persistCookieThrottle[partition]
          return
        }
        cookies.forEach((cookie) => {
          const url = (cookie.secure ? 'https://' : 'http://') + cookie.domain + cookie.path
          session.cookies.remove(url, cookie.name, (error) => {
            if (error) {
              delete this.persistCookieThrottle[partition]
              return
            }
            const expire = new Date()
            expire.setYear(expire.getFullYear() + 1)
            const persistentCookie = {
              url: url,
              name: cookie.name,
              value: cookie.value,
              domain: cookie.domain,
              path: cookie.path,
              secure: cookie.secure,
              httpOnly: cookie.httpOnly,
              expirationDate: expire.getTime()
            }
            session.cookies.set(persistentCookie, (_) => {
              delete this.persistCookieThrottle[partition]
            })
          })
        })
      })
    }, COOKIE_PERSIST_PERIOD)
  }
}

module.exports = MailboxesSessionManager
