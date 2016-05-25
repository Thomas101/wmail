'use strict'

import './mailboxList.less'

const React = require('react')
const flux = {
  mailbox: require('../../stores/mailbox')
}
const MailboxListItem = require('./MailboxListItem')

module.exports = React.createClass({
  displayName: 'MailboxList',

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
    if (this.state.mailboxIds.find((id, i) => id !== nextState.mailboxIds[i].id)) { return true }

    return false
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
    return (
      <div {...this.props} className='mailbox-list'>
        {this.state.mailboxIds.map((id, index, arr) => {
          return (
            <MailboxListItem
              mailboxId={id}
              key={id}
              index={index}
              isFirst={index === 0}
              isLast={index === arr.length - 1} />)
        })}
      </div>
    )
  }
})
