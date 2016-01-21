'use strict'

import "./mailboxList.less"

const React = require('react')
const flux = {
  mailbox: require('../../stores/mailbox')
}
const MailboxListItem = require('./MailboxListItem')
const MailboxListItemAdd = require('./MailboxListItemAdd')

module.exports = React.createClass({
  displayName: 'MailboxList',

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
  * Renders the mailbox list
  * @return jsx elements
  */
  renderMailboxList: function () {
    let mailboxItems = []
    if (this.state.mailbox_ids.length) {
      mailboxItems = this.state.mailbox_ids.map((id, index) => {
        return <MailboxListItem mailbox_id={id} key={id} index={index} />
      })
    }
    return mailboxItems
  },

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
      <div {...this.props}>
        <div className="mailbox-list-shadow-top"></div>
        <div className='mailbox-list'>
          {this.state.mailbox_ids.map((id, index) => {
            return <MailboxListItem mailbox_id={id} key={id} index={index} />
          })}
        </div>
        <div className="mailbox-list-shadow-bottom"></div>
        <MailboxListItemAdd />
      </div>
    )
  }
})
