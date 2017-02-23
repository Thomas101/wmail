import './mailboxWindow.less'

const React = require('react')
const { mailboxStore } = require('../../stores/mailbox')
const Welcome = require('../Welcome/Welcome')
const Mailbox = require('shared/Models/Mailbox/Mailbox')

const GoogleMailboxCalendarTab = require('./Google/GoogleMailboxCalendarTab')
const GoogleMailboxContactsTab = require('./Google/GoogleMailboxContactsTab')
const GoogleMailboxMailTab = require('./Google/GoogleMailboxMailTab')
const GoogleMailboxNotesTab = require('./Google/GoogleMailboxNotesTab')
const GoogleMailboxStorageTab = require('./Google/GoogleMailboxStorageTab')
const GoogleMailboxCommunicationTab = require('./Google/GoogleMailboxCommunicationTab')

module.exports = React.createClass({
  displayName: 'MailboxWindows',

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
  },

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    const mailboxState = mailboxStore.getState()
    return {
      tabIds: this.generateMailboxList(mailboxState),
      activeMailboxId: mailboxState.activeMailboxId() // doesn't cause re-render
    }
  },

  /**
  * Generates the mailbox list from the state
  * @param mailboxState: the state of the mailbox
  * @return a list of mailboxIds + service types
  */
  generateMailboxList (mailboxState) {
    return mailboxState.allMailboxes().reduce((acc, mailbox) => {
      return acc.concat(
        [`${mailbox.type}:${mailbox.id}:${Mailbox.SERVICES.DEFAULT}`],
        mailbox.enabledServies.map((service) => {
          return `${mailbox.type}:${mailbox.id}:${service}`
        })
      )
    }, [])
  },

  mailboxesChanged (mailboxState) {
    this.setState({
      tabIds: this.generateMailboxList(mailboxState),
      activeMailboxId: mailboxState.activeMailboxId()
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (JSON.stringify(this.state.tabIds) !== JSON.stringify(nextState.tabIds)) { return true }
    return false
  },

  /**
  * Renders an individual tab
  * @param key: the element key
  * @param mailboxType: the type of mailbox
  * @param mailboxId: the id of the mailbox
  * @param service: the service of the tab
  * @return jsx
  */
  renderTab (key, mailboxType, mailboxId, service) {
    if (mailboxType === Mailbox.TYPE_GMAIL || mailboxType === Mailbox.TYPE_GINBOX) {
      switch (service) {
        case Mailbox.SERVICES.DEFAULT: return (<GoogleMailboxMailTab mailboxId={mailboxId} key={key} />)
        case Mailbox.SERVICES.CALENDAR: return (<GoogleMailboxCalendarTab mailboxId={mailboxId} key={key} />)
        case Mailbox.SERVICES.CONTACTS: return (<GoogleMailboxContactsTab mailboxId={mailboxId} key={key} />)
        case Mailbox.SERVICES.NOTES: return (<GoogleMailboxNotesTab mailboxId={mailboxId} key={key} />)
        case Mailbox.SERVICES.STORAGE: return (<GoogleMailboxStorageTab mailboxId={mailboxId} key={key} />)
        case Mailbox.SERVICES.COMMUNICATION: return (<GoogleMailboxCommunicationTab mailboxId={mailboxId} key={key} />)
      }
    }

    return undefined
  },

  render () {
    const { tabIds } = this.state

    if (tabIds.length) {
      return (
        <div className='ReactComponent-MailboxWindows'>
          {tabIds.map((id) => {
            const [mailboxType, mailboxId, service] = id.split(':')
            return this.renderTab(id, mailboxType, mailboxId, service)
          })}
        </div>
      )
    } else {
      return (
        <div className='ReactComponent-MailboxWindows'>
          <Welcome />
        </div>
      )
    }
  }
})
