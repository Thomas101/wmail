'use strict'

const React = require('react')
const flux = {
  mailbox: require('../../stores/mailbox')
}
const GoogleMailboxWindow = require('./GoogleMailboxWindow')
const Welcome = require('../Welcome/Welcome')

/* eslint-disable react/prop-types */

module.exports = React.createClass({
  displayName: 'MailboxWindows',

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount: function () {
    flux.mailbox.S.listen(this.mailboxesChanged)
  },

  componentWillUnmount: function () {
    flux.mailbox.S.unlisten(this.mailboxesChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState: function () {
    return { mailbox_ids: flux.mailbox.S.getState().ids() }
  },

  mailboxesChanged: function (store) {
    this.setState({ mailbox_ids: store.ids() })
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    if (!this.state || !nextState) { return true }
    if (this.state.mailbox_ids.length !== nextState.mailbox_ids.length) { return true }

    const mismatch = this.state.mailbox_ids.findIndex(id => {
      return nextState.mailbox_ids.findIndex(nId => nId === id) === -1
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
  render: function () {
    if (this.state.mailbox_ids.length) {
      return (
        <div className='mailboxes'>
          { this.state.mailbox_ids.map(id => {
            return <GoogleMailboxWindow mailbox_id={id} key={id} />
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
