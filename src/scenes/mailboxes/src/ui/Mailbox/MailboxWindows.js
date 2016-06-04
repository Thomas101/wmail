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
    return { mailboxIds: flux.mailbox.S.getState().mailboxIds() }
  },

  mailboxesChanged (store) {
    this.setState({ mailboxIds: store.mailboxIds() })
  },

  shouldComponentUpdate (nextProps, nextState) {
    if (!this.state || !nextState) { return true }
    if (this.state.mailboxIds.length !== nextState.mailboxIds.length) { return true }

    const mismatch = this.state.mailboxIds.findIndex((id) => {
      return nextState.mailboxIds.findIndex((nId) => nId === id) === -1
    }) !== -1
    if (mismatch) { return true }

    return false
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
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
