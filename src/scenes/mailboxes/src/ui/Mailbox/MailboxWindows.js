import './mailboxWindow.less'

const React = require('react')
const flux = {
  mailbox: require('../../stores/mailbox')
}
const GoogleMailboxWindow = require('./GoogleMailboxWindow')
const Welcome = require('../Welcome/Welcome')

module.exports = React.createClass({
  displayName: 'MailboxWindows',

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    flux.mailbox.S.listen(this.mailboxesChanged)
  },

  componentWillUnmount () {
    flux.mailbox.S.unlisten(this.mailboxesChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    const mailboxStore = flux.mailbox.S.getState()
    return {
      mailboxIds: mailboxStore.mailboxIds(),
      activeMailboxId: mailboxStore.activeMailboxId() // doesn't cause re-render
    }
  },

  mailboxesChanged (store) {
    this.setState({
      mailboxIds: store.mailboxIds(),
      activeMailboxId: store.activeMailboxId()
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

    if (!this.state || !nextState) { return true }
    if (this.state.mailboxIds.length !== nextState.mailboxIds.length) { return true }

    const mismatch = this.state.mailboxIds.findIndex((id) => {
      return nextState.mailboxIds.findIndex((nId) => nId === id) === -1
    }) !== -1
    if (mismatch) { return true }

    return false
  },

  render () {
    if (this.state.mailboxIds.length) {
      return (
        <div className='mailboxes'>
          {this.state.mailboxIds.map((id) => {
            return (<GoogleMailboxWindow mailboxId={id} key={id} />)
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
