const React = require('react')
const MailboxTabSleepable = require('../MailboxTabSleepable')
const Mailbox = require('shared/Models/Mailbox/Mailbox')
const { settingsStore } = require('../../../stores/settings')
const URL = window.nativeRequire('url')
const {
  remote: {shell}, ipcRenderer
} = window.nativeRequire('electron')

const REF = 'mailbox_tab'

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'GoogleMailboxStorageTab',
  propTypes: {
    mailboxId: React.PropTypes.string.isRequired
  },

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
  },

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
  },

  /* **************************************************************************/
  // Data lifecylce
  /* **************************************************************************/

  getInitialState () {
    const settingsState = settingsStore.getState()
    return {
      os: settingsState.os
    }
  },

  settingsChanged (settingsState) {
    this.setState({ os: settingsState.os })
  },

  /* **************************************************************************/
  // Browser Events
  /* **************************************************************************/

  /**
  * Opens a new url in the correct way
  * @param url: the url to open
  */
  handleOpenNewWindow (url) {
    const purl = URL.parse(url)
    if (purl.host === 'docs.google.com') {
      ipcRenderer.send('new-window', { partition: 'persist:' + this.props.mailboxId, url: url })
    } else {
      shell.openExternal(url, { activate: !this.state.os.openLinksInBackground })
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { mailboxId } = this.props

    return (
      <MailboxTabSleepable
        ref={REF}
        preload='../platform/webviewInjection/googleService'
        mailboxId={mailboxId}
        service={Mailbox.SERVICES.STORAGE}
        newWindow={(evt) => { this.handleOpenNewWindow(evt.url) }} />
    )
  }
})
