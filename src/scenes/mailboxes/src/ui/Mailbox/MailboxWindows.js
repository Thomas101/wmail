import './mailboxWindow.less'

const React = require('react')
const { mailboxStore } = require('../../stores/mailbox')
const GoogleMailboxMailTab = require('./GoogleMailboxMailTab')
const Welcome = require('../Welcome/Welcome')

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
      mailboxIds: mailboxState.mailboxIds(),
      activeMailboxId: mailboxState.activeMailboxId() // doesn't cause re-render
    }
  },

  mailboxesChanged (mailboxState) {
    this.setState({
      mailboxIds: mailboxState.mailboxIds(),
      activeMailboxId: mailboxState.activeMailboxId()
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * This deals with an electron bug by badly updating the body style
  * https://github.com/Thomas101/wmail/issues/211
  */
  preventWindowMovementBug (nextState) {
    if (this.state.activeMailboxId !== nextState.activeMailboxId) {
      setTimeout(() => {
        document.body.style.position = 'absolute'
        setTimeout(() => {
          document.body.style.position = 'fixed'
        }, 50)
      }, 50)
    }
  },

  shouldComponentUpdate (nextProps, nextState) {
    this.preventWindowMovementBug(nextState)

    if (JSON.stringify(this.state.mailboxIds) !== JSON.stringify(nextState.mailboxIds)) { return true }

    return false
  },

  render () {
    const { mailboxIds } = this.state
    if (mailboxIds.length) {
      return (
        <div className='mailboxes'>
          {mailboxIds.map((id) => {
            return (<GoogleMailboxMailTab mailboxId={id} key={id} />)
          })}
        </div>
      )
    } else {
      return (
        <div className='mailboxes'>
          <Welcome />
        </div>
      )
    }
  }
})
