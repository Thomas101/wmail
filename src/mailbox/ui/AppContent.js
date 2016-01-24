'use strict'

import './appContent.less'

const React = require('react')
const flux = {
  mailbox: require('../stores/mailbox'),
  google: require('../stores/google')
}
const GoogleMailboxWindow = require('./Mailbox/GoogleMailboxWindow')
const Sidelist = require('./Sidelist')
const Welcome = require('./Welcome/Welcome')

module.exports = React.createClass({
  displayName: 'AppContent',

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
    if (this.state.mailbox_ids.find((id, i) => id !== nextState.mailbox_ids[i].id)) { return true }

    return false
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the mailboxes
  * @return jsx elements
  */
  renderMailboxWindows: function () {
    if (this.state.mailbox_ids.length) {
      return this.state.mailbox_ids.map(id => {
        return <GoogleMailboxWindow mailbox_id={id} key={id} />
      })
    } else {
      return <Welcome />
    }
  },

  /**
  * Renders the app
  */
  render: function () {
    return (
      <div>
        <div className='master'>
          <Sidelist />
        </div>
        <div className='detail'>
          <div className='mailboxes'>
            {this.renderMailboxWindows()}
          </div>
        </div>
      </div>
    )
  }
})
