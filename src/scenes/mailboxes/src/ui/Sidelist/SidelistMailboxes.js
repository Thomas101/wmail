const React = require('react')
const { mailboxStore } = require('../../stores/mailbox')
const SidelistItemMailbox = require('./SidelistItemMailbox')

module.exports = React.createClass({

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'SidelistMailboxes',

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
    return {
      mailboxIds: mailboxStore.getState().mailboxIds()
    }
  },

  mailboxesChanged (store) {
    this.setState({
      mailboxIds: store.mailboxIds()
    })
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    if (JSON.stringify(this.state.mailboxIds) !== JSON.stringify(nextState.mailboxIds)) { return true }
    return false
  },

  render () {
    const { styles, ...passProps } = this.props
    const { mailboxIds } = this.state
    return (
      <div style={Object.assign({}, styles)} {...passProps}>
        {mailboxIds.map((mailboxId, index, arr) => {
          return (
            <SidelistItemMailbox
              mailboxId={mailboxId}
              key={mailboxId}
              index={index}
              isFirst={index === 0}
              isLast={index === arr.length - 1} />)
        })}
      </div>
    )
  }
})
