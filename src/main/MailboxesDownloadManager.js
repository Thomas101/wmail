'use strict'

class MailboxesDownloadManager {

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (mailboxWindow) {
    this.inProgress = { }
    this.mailboxWindow = mailboxWindow
  }

  /* ****************************************************************************/
  // App
  /* ****************************************************************************/

  /**
  * Updates the progress bar in the dock
  */
  updateProgressBar () {
    const all = Object.keys(this.inProgress).reduce((acc, id) => {
      acc.received += this.inProgress[id].received
      acc.total += this.inProgress[id].total
      return acc
    }, { received: 0, total: 0 })

    if (all.received === 0 && all.total === 0) {
      this.mailboxWindow.setProgressBar(-1)
    } else {
      this.mailboxWindow.setProgressBar(all.received / all.total)
    }
  }

  /* ****************************************************************************/
  // Updates
  /* ****************************************************************************/

  /**
  * Updates the progress on a download
  * @param id: the download id
  * @param received: the bytes received
  * @param total: the total bytes to download
  */
  updateProgress (id, received, total) {
    this.inProgress[id] = this.inProgress[id] || {}
    this.inProgress[id].received = received
    this.inProgress[id].total = total
    this.updateProgressBar()
  }

  /**
  * Indicates that a download has finished
  * @param id: the download id
  */
  downloadFinished (id) {
    delete this.inProgress[id]
    this.updateProgressBar()
  }
}

module.exports = MailboxesDownloadManager
