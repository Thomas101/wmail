const React = require('react')
const MailboxTabSleepable = require('../MailboxTabSleepable')
const Mailbox = require('shared/Models/Mailbox/Mailbox')
const { settingsStore } = require('../../../stores/settings')
const URL = window.nativeRequire('url')

const REF = 'mailbox_tab'

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'GoogleMailboxCommunicationTab',
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
    const purl = URL.parse(url, true)

    if (purl.host === 'hangouts.google.com') {
      this.setState({ browserSrc: url })
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
        src={this.state.browserSrc}
        preload='../platform/webviewInjection/googleService'
        mailboxId={mailboxId}
        service={Mailbox.SERVICES.COMMUNICATION}
        newWindow={(evt) => { this.handleOpenNewWindow(evt.url) }} />
    )
  }
})
