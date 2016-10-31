const React = require('react')
const {Paper} = require('material-ui')
const styles = require('../settingStyles')
const shallowCompare = require('react-addons-shallow-compare')
const Colors = require('material-ui/styles/colors')
const { remote } = window.nativeRequire('electron')
const { shell } = remote
const { WEB_URL, GITHUB_URL, GITHUB_ISSUE_URL } = require('shared/constants')
const {mailboxDispatch} = require('../../../Dispatch')
const mailboxStore = require('../../../stores/mailbox/mailboxStore')

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'InfoSettingsSection',

  /* **************************************************************************/
  // UI Event
  /* **************************************************************************/

  /**
  * Shows a snapshot of the current memory consumed
  */
  handleShowMemoryInfo (evt) {
    evt.preventDefault()

    const sizeToMb = (size) => { return Math.round(size / 1024) }

    mailboxDispatch.fetchProcessMemoryInfo().then((mailboxesProc) => {
      const mailboxProcIndex = mailboxesProc.reduce((acc, info) => {
        acc[info.mailboxId] = info.memoryInfo
        return acc
      }, {})
      const mailboxes = mailboxStore.getState().mailboxIds().map((mailboxId, index) => {
        if (mailboxProcIndex[mailboxId]) {
          return `Mailbox ${index + 1}: ${sizeToMb(mailboxProcIndex[mailboxId].workingSetSize)}mb`
        } else {
          return `Mailbox ${index + 1}: No info`
        }
      })

      window.alert([
        `Main Process ${sizeToMb(remote.process.getProcessMemoryInfo().workingSetSize)}mb`,
        `Mailboxes Window ${sizeToMb(process.getProcessMemoryInfo().workingSetSize)}mb`,
        ''
      ].concat(mailboxes).join('\n'))
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  render () {
    return (
      <Paper zDepth={1} style={styles.paper} {...this.props}>
        <a
          style={{color: Colors.blue700, fontSize: '85%', marginBottom: 10, display: 'block'}}
          onClick={(evt) => { evt.preventDefault(); shell.openExternal(WEB_URL) }}
          href={WEB_URL}>WMail Website</a>
        <a
          style={{color: Colors.blue700, fontSize: '85%', marginBottom: 10, display: 'block'}}
          onClick={(evt) => { evt.preventDefault(); shell.openExternal(GITHUB_URL) }}
          href={GITHUB_URL}>WMail GitHub</a>
        <a
          style={{color: Colors.blue700, fontSize: '85%', marginBottom: 10, display: 'block'}}
          onClick={(evt) => { evt.preventDefault(); shell.openExternal(GITHUB_ISSUE_URL) }}
          href={GITHUB_ISSUE_URL}>Report a bug</a>
        <a
          style={{color: Colors.blue700, fontSize: '85%', marginBottom: 10, display: 'block'}}
          onClick={this.handleShowMemoryInfo}
          href='#'>Memory Info</a>
        <p>
          Made with ♥ by Thomas Beverley
        </p>
      </Paper>
    )
  }
})
