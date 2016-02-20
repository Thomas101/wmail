'use strict'

const electron = require('electron')
const uuid = require('uuid')
const fs = require('fs-extra')
const path = require('path')

class MailboxesSessionManager {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param mailboxWindow: the mailbox window instance we're working for
  * @param appSettings: the app settings
  */
  constructor (mailboxWindow, appSettings) {
    this.mailboxWindow = mailboxWindow
    this.appSettings = appSettings
    this.downloadsInProgress = { }

    this.__managed__ = new Set()
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
    let savedLocation = null
    if (!this.appSettings.alwaysAskDownloadLocation && this.appSettings.defaultDownloadLocation) {
      const folderLocation = this.appSettings.defaultDownloadLocation
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
          savedLocation = { path: folderLocation, name: testName }
          break
        }
      }
    } else {
      savedLocation = { path: electron.app.getPath('downloads'), name: item.getFilename() }
    }

    // Report the progress to the window to display it
    const totalBytes = item.getTotalBytes()
    const id = uuid.v4()
    item.on('updated', () => {
      this.updateDownloadProgress(id, item.getReceivedBytes(), totalBytes)
    })
    item.on('done', (e, state) => {
      this.downloadFinished(id)
      this.mailboxWindow.downloadCompleted(savedLocation.path, savedLocation.name)
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

}

module.exports = MailboxesSessionManager
