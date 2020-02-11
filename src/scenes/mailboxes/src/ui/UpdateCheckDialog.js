const React = require('react')
const shallowCompare = require('react-addons-shallow-compare')
const TimerMixin = require('react-timer-mixin')
const compareVersion = require('compare-version')
const { UPDATE_CHECK_URL, UPDATE_CHECK_INTERVAL, UPDATE_DOWNLOAD_URL } = require('shared/constants')
const { FlatButton, RaisedButton, Dialog } = require('material-ui')
const settingsStore = require('../stores/settings/settingsStore')
const settingsActions = require('../stores/settings/settingsActions')
const pkg = window.appPackage()
const {
  remote: {shell}
} = window.nativeRequire('electron')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'UpdateCheckDialog',
  mixins: [TimerMixin],

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.recheckTO = null
    this.checkNow()
  },

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      newerVersion: null,
      recheckRestart: false
    }
  },

  /* **************************************************************************/
  // Checking
  /* **************************************************************************/

  /**
  * Checks with the server for an update
  */
  checkNow () {
    Promise.resolve()
      .then(() => window.fetch(`${UPDATE_CHECK_URL}?_=${new Date().getTime()}`))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
      .then((res) => {
        let update
        if (pkg.prerelease) {
          if (compareVersion(res.prerelease.version, res.release.version) >= 1) { // prerelease is newest
            if (compareVersion(res.prerelease.version, pkg.version) >= 1) {
              update = res.prerelease.version
            }
          } else { // release is newest
            if (compareVersion(res.release.version, pkg.version) >= 1) {
              update = res.release.version
            }
          }
        } else {
          if (compareVersion(res.release.version, pkg.version) >= 1) {
            update = res.release.version
          }
        }

        if (pkg.prerelease) {
          if (res.prerelease.news) {
            settingsActions.updateLatestNews(res.prerelease.news)
          }
        } else {
          if (res.release.news) {
            settingsActions.updateLatestNews(res.release.news)
          }
        }

        if (update) {
          if (this.state.recheckRestart || settingsStore.getState().app.checkForUpdates === false) {
            this.scheduleNextCheck()
          } else {
            this.setState({ newerVersion: update })
            this.clearTimeout(this.recheckTO)
          }
        } else {
          this.setState({ newerVersion: null })
          this.scheduleNextCheck()
        }
      })
  },

  /**
  * Schedules the next check
  */
  scheduleNextCheck () {
    this.clearTimeout(this.recheckTO)
    this.recheckTO = this.setTimeout(() => {
      this.checkNow()
    }, UPDATE_CHECK_INTERVAL)
  },

  /**
  * Dismisses the modal an waits for the next check
  */
  recheckLater () {
    this.setState({ newerVersion: null })
    this.scheduleNextCheck()
  },

  /**
  * Cancels the recheck and rechecks after reboot
  */
  recheckRestart () {
    this.setState({
      newerVersion: null,
      recheckRestart: true
    })
    this.recheckLater()
  },

  /**
  * Opens the download link
  */
  downloadNow () {
    shell.openExternal(UPDATE_DOWNLOAD_URL)
    this.recheckLater()
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    const buttons = [
      (<FlatButton
        key='restart'
        label='After Restart'
        style={{ marginRight: 16 }}
        onClick={this.recheckRestart} />),
      (<FlatButton
        key='later'
        label='Later'
        style={{ marginRight: 16 }}
        onClick={this.recheckLater} />),
      (<RaisedButton
        key='now'
        primary
        label='Download Now'
        onClick={this.downloadNow} />)
    ]

    return (
      <Dialog
        modal={false}
        title='Update Available'
        actions={buttons}
        open={this.state.newerVersion !== null}
        onRequestClose={this.recheckLater}>
        <p>
          <span>Version </span>
          <span>{this.state.newerVersion}</span>
          <span> is now available. Do you want to download it now?</span>
        </p>
      </Dialog>
    )
  }
})
